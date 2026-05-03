"""Expense tracking routes."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import ExpenseCreate, ExpenseUpdate

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("")
async def list_expenses(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: str = Query(None),
    month: int = Query(None),
    year: int = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """List expenses with filtering and pagination."""
    db = await get_db()
    try:
        offset = (page - 1) * per_page
        where_clauses = []
        params = []

        if category:
            where_clauses.append("e.category = ?")
            params.append(category)

        if month:
            where_clauses.append(
                "CAST(strftime('%m', e.expense_date) AS INTEGER) = ?"
            )
            params.append(month)

        if year:
            where_clauses.append(
                "CAST(strftime('%Y', e.expense_date) AS INTEGER) = ?"
            )
            params.append(year)

        where_sql = (
            "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        )

        count_cursor = await db.execute(
            f"SELECT COUNT(*) as total FROM expenses e {where_sql}", params
        )
        total = (await count_cursor.fetchone())["total"]

        cursor = await db.execute(
            f"""SELECT e.*,
                b.name as building_name
            FROM expenses e
            LEFT JOIN buildings b ON b.id = e.building_id
            {where_sql}
            ORDER BY e.expense_date DESC
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


@router.get("/summary")
async def expense_summary(
    year: int = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Get expense summary by category."""
    db = await get_db()
    try:
        year_filter = ""
        params = []
        if year:
            year_filter = (
                "WHERE CAST(strftime('%Y', expense_date) AS INTEGER) = ?"
            )
            params.append(year)

        cursor = await db.execute(
            f"""SELECT
                category,
                COUNT(*) as count,
                COALESCE(SUM(amount_usd), 0) as total_usd,
                COALESCE(SUM(amount_khr), 0) as total_khr
            FROM expenses
            {year_filter}
            GROUP BY category
            ORDER BY total_usd DESC""",
            params,
        )
        categories = [dict(row) for row in await cursor.fetchall()]

        total_cursor = await db.execute(
            f"""SELECT
                COALESCE(SUM(amount_usd), 0) as total_usd,
                COALESCE(SUM(amount_khr), 0) as total_khr,
                COUNT(*) as total_count
            FROM expenses
            {year_filter}""",
            params,
        )
        totals = dict(await total_cursor.fetchone())

        monthly_cursor = await db.execute(
            f"""SELECT
                CAST(strftime('%m', expense_date) AS INTEGER) as month,
                COALESCE(SUM(amount_usd), 0) as total_usd,
                COALESCE(SUM(amount_khr), 0) as total_khr
            FROM expenses
            {year_filter}
            GROUP BY strftime('%m', expense_date)
            ORDER BY month""",
            params,
        )
        monthly = [dict(row) for row in await monthly_cursor.fetchall()]

        return {
            "categories": categories,
            "totals": totals,
            "monthly": monthly,
        }
    finally:
        await db.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense: ExpenseCreate, current_user: dict = Depends(get_current_user)
):
    """Create a new expense record."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """INSERT INTO expenses
            (category, description, amount_usd, amount_khr,
             expense_date, building_id, vendor, receipt_number, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                expense.category,
                expense.description,
                expense.amount_usd,
                expense.amount_khr,
                expense.expense_date,
                expense.building_id,
                expense.vendor,
                expense.receipt_number,
                expense.notes,
            ),
        )
        await db.commit()
        return {"id": cursor.lastrowid, "message": "បង្កើតកំណត់ត្រាចំណាយបានជោគជ័យ"}
    finally:
        await db.close()


@router.put("/{expense_id}")
async def update_expense(
    expense_id: int,
    expense: ExpenseUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update an expense record."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id FROM expenses WHERE id = ?", (expense_id,)
        )
        if not await cursor.fetchone():
            raise HTTPException(
                status_code=404, detail="រកមិនឃើញកំណត់ត្រាចំណាយ"
            )

        update_data = expense.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(
                status_code=400, detail="គ្មានទិន្នន័យត្រូវធ្វើបច្ចុប្បន្នភាព"
            )

        set_clauses = [f"{key} = ?" for key in update_data.keys()]
        set_clauses.append("updated_at = CURRENT_TIMESTAMP")
        values = list(update_data.values()) + [expense_id]

        await db.execute(
            f"UPDATE expenses SET {', '.join(set_clauses)} WHERE id = ?",
            values,
        )
        await db.commit()
        return {"message": "ធ្វើបច្ចុប្បន្នភាពកំណត់ត្រាចំណាយបានជោគជ័យ"}
    finally:
        await db.close()


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: int, current_user: dict = Depends(get_current_user)
):
    """Delete an expense record."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id FROM expenses WHERE id = ?", (expense_id,)
        )
        if not await cursor.fetchone():
            raise HTTPException(
                status_code=404, detail="រកមិនឃើញកំណត់ត្រាចំណាយ"
            )

        await db.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
        await db.commit()
        return {"message": "លុបកំណត់ត្រាចំណាយបានជោគជ័យ"}
    finally:
        await db.close()
