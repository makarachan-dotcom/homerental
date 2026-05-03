"""Room management routes."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import RoomCreate, RoomUpdate

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])


@router.get("")
async def list_rooms(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    building_id: int = Query(None),
    status_filter: str = Query("all"),
    floor: int = Query(None),
    room_type: str = Query(None),
    search: str = Query("", max_length=100),
    current_user: dict = Depends(get_current_user),
):
    """List rooms with filters."""
    db = await get_db()
    try:
        offset = (page - 1) * per_page
        where_clauses = ["r.is_active = 1"]
        params = []

        if building_id:
            where_clauses.append("r.building_id = ?")
            params.append(building_id)

        if status_filter != "all":
            where_clauses.append("r.status = ?")
            params.append(status_filter)

        if floor:
            where_clauses.append("r.floor = ?")
            params.append(floor)

        if room_type:
            where_clauses.append("r.room_type = ?")
            params.append(room_type)

        if search:
            where_clauses.append("r.room_number LIKE ?")
            params.append(f"%{search}%")

        where_sql = "WHERE " + " AND ".join(where_clauses)

        count_cursor = await db.execute(
            f"SELECT COUNT(*) as total FROM rooms r {where_sql}", params
        )
        total = (await count_cursor.fetchone())["total"]

        cursor = await db.execute(
            f"""SELECT r.*,
                b.name as building_name,
                t.first_name || ' ' || t.last_name as tenant_name
            FROM rooms r
            LEFT JOIN buildings b ON b.id = r.building_id
            LEFT JOIN contracts c ON c.room_id = r.id AND c.status = 'active'
            LEFT JOIN tenants t ON t.id = c.tenant_id
            {where_sql}
            ORDER BY r.floor, r.room_number
            LIMIT ? OFFSET ?""",
            params + [per_page, offset],
        )
        rooms = [dict(row) for row in await cursor.fetchall()]

        return {
            "data": rooms,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
        }
    finally:
        await db.close()


@router.get("/stats")
async def room_stats(current_user: dict = Depends(get_current_user)):
    """Get room statistics."""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
                SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
                SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved
            FROM rooms WHERE is_active = 1
        """)
        stats = dict(await cursor.fetchone())
        return stats
    finally:
        await db.close()


@router.get("/{room_id}")
async def get_room(room_id: int, current_user: dict = Depends(get_current_user)):
    """Get room details."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT r.*,
                b.name as building_name,
                t.first_name || ' ' || t.last_name as tenant_name,
                t.phone as tenant_phone,
                c.id as contract_id,
                c.start_date as contract_start,
                c.end_date as contract_end,
                c.monthly_rent_usd,
                c.monthly_rent_khr
            FROM rooms r
            LEFT JOIN buildings b ON b.id = r.building_id
            LEFT JOIN contracts c ON c.room_id = r.id AND c.status = 'active'
            LEFT JOIN tenants t ON t.id = c.tenant_id
            WHERE r.id = ?""",
            (room_id,),
        )
        room = await cursor.fetchone()
        if not room:
            raise HTTPException(status_code=404, detail="រកមិនឃើញបន្ទប់")
        return dict(room)
    finally:
        await db.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_room(room: RoomCreate, current_user: dict = Depends(get_current_user)):
    """Create a new room."""
    db = await get_db()
    try:
        # Verify building exists
        cursor = await db.execute(
            "SELECT id FROM buildings WHERE id = ?", (room.building_id,)
        )
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញអគារ")

        cursor = await db.execute(
            """INSERT INTO rooms
            (building_id, room_number, floor, room_type, size_sqm,
             price_usd, price_khr, deposit_usd, deposit_khr,
             description, amenities, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                room.building_id, room.room_number, room.floor, room.room_type,
                room.size_sqm, room.price_usd, room.price_khr,
                room.deposit_usd, room.deposit_khr,
                room.description, room.amenities, room.image_url,
            ),
        )
        await db.commit()
        return {"id": cursor.lastrowid, "message": "បង្កើតបន្ទប់ថ្មីបានជោគជ័យ"}
    finally:
        await db.close()


@router.put("/{room_id}")
async def update_room(
    room_id: int, room: RoomUpdate, current_user: dict = Depends(get_current_user)
):
    """Update room information."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM rooms WHERE id = ?", (room_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញបន្ទប់")

        update_data = room.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="គ្មានទិន្នន័យត្រូវធ្វើបច្ចុប្បន្នភាព")

        set_clauses = [f"{key} = ?" for key in update_data.keys()]
        set_clauses.append("updated_at = CURRENT_TIMESTAMP")
        values = list(update_data.values()) + [room_id]

        await db.execute(
            f"UPDATE rooms SET {', '.join(set_clauses)} WHERE id = ?", values
        )
        await db.commit()
        return {"message": "ធ្វើបច្ចុប្បន្នភាពបន្ទប់បានជោគជ័យ"}
    finally:
        await db.close()


@router.delete("/{room_id}")
async def delete_room(room_id: int, current_user: dict = Depends(get_current_user)):
    """Soft delete a room."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM rooms WHERE id = ?", (room_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញបន្ទប់")

        cursor = await db.execute(
            "SELECT id FROM contracts WHERE room_id = ? AND status = 'active'",
            (room_id,),
        )
        if await cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="មិនអាចលុបបន្ទប់ដែលមានកិច្ចសន្យាសកម្មបានទេ",
            )

        await db.execute(
            "UPDATE rooms SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (room_id,),
        )
        await db.commit()
        return {"message": "លុបបន្ទប់បានជោគជ័យ"}
    finally:
        await db.close()
