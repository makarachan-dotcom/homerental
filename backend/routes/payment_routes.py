"""Payment management routes."""

import secrets as sec
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import PaymentCreate, PaymentUpdate

router = APIRouter(prefix="/api/payments", tags=["Payments"])


def generate_receipt_number() -> str:
    """Generate unique receipt number."""
    now = datetime.now()
    return f"RCP-{now.year}-{sec.token_hex(3).upper()}"


@router.get("")
async def list_payments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    contract_id: int = Query(None),
    tenant_id: int = Query(None),
    status_filter: str = Query("all"),
    payment_type: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """List payments with filters."""
    db = await get_db()
    try:
        offset = (page - 1) * per_page
        where_clauses = []
        params = []

        if contract_id:
            where_clauses.append("p.contract_id = ?")
            params.append(contract_id)

        if tenant_id:
            where_clauses.append("p.tenant_id = ?")
            params.append(tenant_id)

        if status_filter != "all":
            where_clauses.append("p.status = ?")
            params.append(status_filter)

        if payment_type:
            where_clauses.append("p.payment_type = ?")
            params.append(payment_type)

        if start_date:
            where_clauses.append("p.payment_date >= ?")
            params.append(start_date)

        if end_date:
            where_clauses.append("p.payment_date <= ?")
            params.append(end_date)

        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        count_cursor = await db.execute(
            f"SELECT COUNT(*) as total FROM payments p {where_sql}", params
        )
        total = (await count_cursor.fetchone())["total"]

        cursor = await db.execute(
            f"""SELECT p.*,
                t.first_name || ' ' || t.last_name as tenant_name,
                r.room_number
            FROM payments p
            LEFT JOIN tenants t ON t.id = p.tenant_id
            LEFT JOIN contracts c ON c.id = p.contract_id
            LEFT JOIN rooms r ON r.id = c.room_id
            {where_sql}
            ORDER BY p.payment_date DESC
            LIMIT ? OFFSET ?""",
            params + [per_page, offset],
        )
        payments = [dict(row) for row in await cursor.fetchall()]

        return {
            "data": payments,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
        }
    finally:
        await db.close()


@router.get("/summary")
async def payment_summary(
    year: int = Query(None),
    month: int = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Get payment summary/statistics."""
    db = await get_db()
    try:
        now = datetime.now()
        target_year = year or now.year
        target_month = month or now.month

        cursor = await db.execute(
            """SELECT
                SUM(CASE WHEN status = 'completed'
                    THEN amount_usd ELSE 0 END) as total_collected_usd,
                SUM(CASE WHEN status = 'completed'
                    THEN amount_khr ELSE 0 END) as total_collected_khr,
                SUM(CASE WHEN status = 'pending'
                    THEN amount_usd ELSE 0 END) as total_pending_usd,
                SUM(CASE WHEN status = 'pending'
                    THEN amount_khr ELSE 0 END) as total_pending_khr,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
            FROM payments
            WHERE period_year = ? AND period_month = ?""",
            (target_year, target_month),
        )
        summary = dict(await cursor.fetchone())

        # Monthly revenue chart data (last 6 months)
        chart_data = []
        for i in range(5, -1, -1):
            m = target_month - i
            y = target_year
            if m <= 0:
                m += 12
                y -= 1
            cursor = await db.execute(
                """SELECT
                    COALESCE(SUM(CASE WHEN status = 'completed'
                        THEN amount_usd ELSE 0 END), 0) as usd,
                    COALESCE(SUM(CASE WHEN status = 'completed'
                        THEN amount_khr ELSE 0 END), 0) as khr
                FROM payments WHERE period_year = ? AND period_month = ?""",
                (y, m),
            )
            row = dict(await cursor.fetchone())
            chart_data.append({"month": f"{y}-{m:02d}", "usd": row["usd"], "khr": row["khr"]})

        summary["chart_data"] = chart_data
        return summary
    finally:
        await db.close()


@router.get("/{payment_id}")
async def get_payment(payment_id: int, current_user: dict = Depends(get_current_user)):
    """Get payment details."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT p.*,
                t.first_name || ' ' || t.last_name as tenant_name,
                t.phone as tenant_phone,
                r.room_number,
                c.contract_number
            FROM payments p
            LEFT JOIN tenants t ON t.id = p.tenant_id
            LEFT JOIN contracts c ON c.id = p.contract_id
            LEFT JOIN rooms r ON r.id = c.room_id
            WHERE p.id = ?""",
            (payment_id,),
        )
        payment = await cursor.fetchone()
        if not payment:
            raise HTTPException(status_code=404, detail="រកមិនឃើញការបង់ប្រាក់")
        return dict(payment)
    finally:
        await db.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment: PaymentCreate, current_user: dict = Depends(get_current_user)
):
    """Record a new payment."""
    db = await get_db()
    try:
        # Verify contract exists
        cursor = await db.execute(
            "SELECT id FROM contracts WHERE id = ?", (payment.contract_id,)
        )
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញកិច្ចសន្យា")

        receipt_number = generate_receipt_number()
        cursor = await db.execute(
            """INSERT INTO payments
            (contract_id, tenant_id, amount_usd, amount_khr, currency,
             payment_type, payment_method, payment_date, due_date,
             period_month, period_year, transaction_ref, receipt_number, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                payment.contract_id, payment.tenant_id,
                payment.amount_usd, payment.amount_khr, payment.currency,
                payment.payment_type, payment.payment_method,
                payment.payment_date, payment.due_date,
                payment.period_month, payment.period_year,
                payment.transaction_ref, receipt_number, payment.notes,
            ),
        )
        await db.commit()
        return {
            "id": cursor.lastrowid,
            "receipt_number": receipt_number,
            "message": "កត់ត្រាការបង់ប្រាក់បានជោគជ័យ",
        }
    finally:
        await db.close()


@router.put("/{payment_id}")
async def update_payment(
    payment_id: int,
    payment: PaymentUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update payment status/details."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM payments WHERE id = ?", (payment_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញការបង់ប្រាក់")

        update_data = payment.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="គ្មានទិន្នន័យត្រូវធ្វើបច្ចុប្បន្នភាព")

        set_clauses = [f"{key} = ?" for key in update_data.keys()]
        values = list(update_data.values()) + [payment_id]

        await db.execute(
            f"UPDATE payments SET {', '.join(set_clauses)} WHERE id = ?", values
        )
        await db.commit()
        return {"message": "ធ្វើបច្ចុប្បន្នភាពការបង់ប្រាក់បានជោគជ័យ"}
    finally:
        await db.close()
