"""Building management routes."""

from fastapi import APIRouter, Depends

from backend.auth import get_current_user
from backend.database import get_db

router = APIRouter(prefix="/api/buildings", tags=["buildings"])


@router.get("")
async def list_buildings(user: dict = Depends(get_current_user)):
    """List all buildings."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM buildings WHERE is_active = 1 "
            "ORDER BY name"
        )
        buildings = [dict(row) for row in await cursor.fetchall()]

        # Add room stats per building
        for building in buildings:
            cursor = await db.execute(
                """SELECT
                    COUNT(*) as total_rooms,
                    COUNT(CASE WHEN status = 'occupied' THEN 1 END)
                        as occupied,
                    COUNT(CASE WHEN status = 'available' THEN 1 END)
                        as available
                FROM rooms WHERE building_id = ? AND is_active = 1""",
                (building["id"],),
            )
            stats = dict(await cursor.fetchone())
            building["room_stats"] = stats

        return {"data": buildings}
    finally:
        await db.close()


@router.get("/{building_id}")
async def get_building(
    building_id: int, user: dict = Depends(get_current_user)
):
    """Get building details with room breakdown."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM buildings WHERE id = ?", (building_id,)
        )
        building = cursor.fetchone()
        if not building:
            from fastapi import HTTPException

            raise HTTPException(
                status_code=404, detail="រកមិនឃើញអគារ"
            )

        building = dict(await cursor.fetchone()) if building else None
        if not building:
            from fastapi import HTTPException

            raise HTTPException(
                status_code=404, detail="រកមិនឃើញអគារ"
            )

        # Get rooms by floor
        cursor = await db.execute(
            """SELECT floor,
                COUNT(*) as total,
                COUNT(CASE WHEN status='occupied' THEN 1 END) as occupied,
                COUNT(CASE WHEN status='available' THEN 1 END) as available
            FROM rooms WHERE building_id = ? AND is_active = 1
            GROUP BY floor ORDER BY floor""",
            (building_id,),
        )
        building["floors_detail"] = [
            dict(row) for row in await cursor.fetchall()
        ]

        return building
    finally:
        await db.close()


@router.post("")
async def create_building(data: dict, user: dict = Depends(get_current_user)):
    """Create a new building."""
    db = await get_db()
    try:
        await db.execute(
            """INSERT INTO buildings
            (name, address, description, total_rooms, floors, amenities)
            VALUES (?, ?, ?, ?, ?, ?)""",
            (
                data.get("name"),
                data.get("address"),
                data.get("description"),
                data.get("total_rooms", 0),
                data.get("floors", 1),
                data.get("amenities"),
            ),
        )
        await db.commit()
        return {"message": "បង្កើតអគារថ org មីបានជោគជ org ័យ"}
    finally:
        await db.close()


@router.put("/{building_id}")
async def update_building(
    building_id: int, data: dict, user: dict = Depends(get_current_user)
):
    """Update building information."""
    db = await get_db()
    try:
        update_fields = []
        values = []
        for key in ["name", "address", "description", "total_rooms",
                    "floors", "amenities"]:
            if key in data:
                update_fields.append(f"{key} = ?")
                values.append(data[key])

        if update_fields:
            values.append(building_id)
            await db.execute(
                f"UPDATE buildings SET {', '.join(update_fields)}, "
                f"updated_at = CURRENT_TIMESTAMP "
                f"WHERE id = ?",
                values,
            )
            await db.commit()

        return {"message": "ធ org ្វើបច org ្ចុប org ្បន org ្នភាពអគារបានជោគជ org ័យ"}
    finally:
        await db.close()
