"""Maintenance request routes."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import MaintenanceCreate, MaintenanceUpdate

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])


@router.get("")
async def list_maintenance(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str = Query("all"),
    priority: str = Query(None),
    room_id: int = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """List maintenance requests."""
    db = await get_db()
    try:
        offset = (page - 1) * per_page
        where_clauses = []
        params = []

        if status_filter != "all":
            where_clauses.append("m.status = ?")
            params.append(status_filter)

        if priority:
            where_clauses.append("m.priority = ?")
            params.append(priority)

        if room_id:
            where_clauses.append("m.room_id = ?")
            params.append(room_id)

        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        count_cursor = await db.execute(
            f"SELECT COUNT(*) as total FROM maintenance_requests m {where_sql}", params
        )
        total = (await count_cursor.fetchone())["total"]

        cursor = await db.execute(
            f"""SELECT m.*,
                r.room_number,
                t.first_name || ' ' || t.last_name as tenant_name
            FROM maintenance_requests m
            LEFT JOIN rooms r ON r.id = m.room_id
            LEFT JOIN tenants t ON t.id = m.tenant_id
            {where_sql}
            ORDER BY
                CASE m.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2
                WHEN 'normal' THEN 3 ELSE 4 END,
                m.reported_date DESC
            LIMIT ? OFFSET ?""",
            params + [per_page, offset],
        )
        items = [dict(row) for row in await cursor.fetchall()]

        return {
            "data": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
        }
    finally:
        await db.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_maintenance(
    request: MaintenanceCreate, current_user: dict = Depends(get_current_user)
):
    """Create a maintenance request."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """INSERT INTO maintenance_requests
            (room_id, tenant_id, title, description, priority, assigned_to,
             estimated_cost, reported_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                request.room_id, request.tenant_id, request.title,
                request.description, request.priority, request.assigned_to,
                request.estimated_cost, request.reported_date,
            ),
        )
        await db.commit()
        return {"id": cursor.lastrowid, "message": "បង្កើតសំណើថែទាំបានជោគជ័យ"}
    finally:
        await db.close()


@router.put("/{request_id}")
async def update_maintenance(
    request_id: int,
    request: MaintenanceUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update maintenance request."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id FROM maintenance_requests WHERE id = ?", (request_id,)
        )
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញសំណើថែទាំ")

        update_data = request.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="គ្មានទិន្នន័យត្រូវធ្វើបច្ចុប្បន្នភាព")

        set_clauses = [f"{key} = ?" for key in update_data.keys()]
        set_clauses.append("updated_at = CURRENT_TIMESTAMP")
        values = list(update_data.values()) + [request_id]

        await db.execute(
            f"UPDATE maintenance_requests SET {', '.join(set_clauses)} WHERE id = ?", values
        )
        await db.commit()
        return {"message": "ធ្វើបច្ចុប្បន្នភាពសំណើថែទាំបានជោគជ័យ"}
    finally:
        await db.close()
