"""Utility billing routes."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import UtilityCreate

router = APIRouter(prefix="/api/utilities", tags=["Utilities"])


@router.get("")
async def list_utilities(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    contract_id: int = Query(None),
    room_id: int = Query(None),
    period_month: int = Query(None),
    period_year: int = Query(None),
    status_filter: str = Query("all"),
    current_user: dict = Depends(get_current_user),
):
    """List utility bills."""
    db = await get_db()
    try:
        offset = (page - 1) * per_page
        where_clauses = []
        params = []

        if contract_id:
            where_clauses.append("u.contract_id = ?")
            params.append(contract_id)

        if room_id:
            where_clauses.append("u.room_id = ?")
            params.append(room_id)

        if period_month:
            where_clauses.append("u.period_month = ?")
            params.append(period_month)

        if period_year:
            where_clauses.append("u.period_year = ?")
            params.append(period_year)

        if status_filter != "all":
            where_clauses.append("u.status = ?")
            params.append(status_filter)

        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        count_cursor = await db.execute(
            f"SELECT COUNT(*) as total FROM utilities u {where_sql}", params
        )
        total = (await count_cursor.fetchone())["total"]

        cursor = await db.execute(
            f"""SELECT u.*, r.room_number
            FROM utilities u
            LEFT JOIN rooms r ON r.id = u.room_id
            {where_sql}
            ORDER BY u.period_year DESC, u.period_month DESC
            LIMIT ? OFFSET ?""",
            params + [per_page, offset],
        )
        utilities = [dict(row) for row in await cursor.fetchall()]

        return {
            "data": utilities,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
        }
    finally:
        await db.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_utility(
    utility: UtilityCreate, current_user: dict = Depends(get_current_user)
):
    """Create a utility billing record."""
    db = await get_db()
    try:
        # Calculate usage and amounts
        electricity_usage = utility.electricity_current - utility.electricity_previous
        electricity_amount = electricity_usage * utility.electricity_rate

        water_usage = utility.water_current - utility.water_previous
        water_amount = water_usage * utility.water_rate

        total_amount = (
            electricity_amount + water_amount +
            utility.internet_amount + utility.garbage_amount + utility.other_amount
        )

        cursor = await db.execute(
            """INSERT INTO utilities
            (contract_id, room_id, period_month, period_year,
             electricity_previous, electricity_current, electricity_usage,
             electricity_rate, electricity_amount,
             water_previous, water_current, water_usage,
             water_rate, water_amount,
             internet_amount, garbage_amount, other_amount,
             total_amount, currency, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                utility.contract_id, utility.room_id,
                utility.period_month, utility.period_year,
                utility.electricity_previous, utility.electricity_current,
                electricity_usage, utility.electricity_rate, electricity_amount,
                utility.water_previous, utility.water_current,
                water_usage, utility.water_rate, water_amount,
                utility.internet_amount, utility.garbage_amount,
                utility.other_amount, total_amount, utility.currency, utility.notes,
            ),
        )
        await db.commit()
        return {
            "id": cursor.lastrowid,
            "total_amount": total_amount,
            "message": "កត់ត្រាវិក័យប័ត្រប្រើប្រាស់បានជោគជ័យ",
        }
    finally:
        await db.close()


@router.put("/{utility_id}/status")
async def update_utility_status(
    utility_id: int,
    new_status: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    """Update utility bill status."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM utilities WHERE id = ?", (utility_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញវិក័យប័ត្រ")

        await db.execute(
            "UPDATE utilities SET status = ? WHERE id = ?", (new_status, utility_id)
        )
        await db.commit()
        return {"message": "ធ្វើបច្ចុប្បន្នភាពស្ថានភាពបានជោគជ័យ"}
    finally:
        await db.close()
