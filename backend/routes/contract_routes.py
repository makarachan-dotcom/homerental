"""Contract management routes."""

import secrets

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import ContractCreate, ContractUpdate

router = APIRouter(prefix="/api/contracts", tags=["Contracts"])


def generate_contract_number() -> str:
    """Generate unique contract number."""
    import datetime
    now = datetime.datetime.now()
    return f"CTR-{now.year}-{secrets.token_hex(3).upper()}"


@router.get("")
async def list_contracts(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str = Query("all"),
    search: str = Query("", max_length=100),
    current_user: dict = Depends(get_current_user),
):
    """List all contracts."""
    db = await get_db()
    try:
        offset = (page - 1) * per_page
        where_clauses = []
        params = []

        if status_filter != "all":
            where_clauses.append("c.status = ?")
            params.append(status_filter)

        if search:
            where_clauses.append(
                "(c.contract_number LIKE ? OR t.first_name LIKE ? OR t.last_name LIKE ?)"
            )
            search_param = f"%{search}%"
            params.extend([search_param] * 3)

        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        count_cursor = await db.execute(
            f"""SELECT COUNT(*) as total FROM contracts c
            LEFT JOIN tenants t ON t.id = c.tenant_id
            {where_sql}""",
            params,
        )
        total = (await count_cursor.fetchone())["total"]

        cursor = await db.execute(
            f"""SELECT c.*,
                t.first_name || ' ' || t.last_name as tenant_name,
                t.phone as tenant_phone,
                r.room_number
            FROM contracts c
            LEFT JOIN tenants t ON t.id = c.tenant_id
            LEFT JOIN rooms r ON r.id = c.room_id
            {where_sql}
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?""",
            params + [per_page, offset],
        )
        contracts = [dict(row) for row in await cursor.fetchall()]

        return {
            "data": contracts,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
        }
    finally:
        await db.close()


@router.get("/{contract_id}")
async def get_contract(contract_id: int, current_user: dict = Depends(get_current_user)):
    """Get contract details."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT c.*,
                t.first_name || ' ' || t.last_name as tenant_name,
                t.phone as tenant_phone,
                t.email as tenant_email,
                r.room_number,
                r.floor,
                b.name as building_name
            FROM contracts c
            LEFT JOIN tenants t ON t.id = c.tenant_id
            LEFT JOIN rooms r ON r.id = c.room_id
            LEFT JOIN buildings b ON b.id = r.building_id
            WHERE c.id = ?""",
            (contract_id,),
        )
        contract = await cursor.fetchone()
        if not contract:
            raise HTTPException(status_code=404, detail="រកមិនឃើញកិច្ចសន្យា")
        return dict(contract)
    finally:
        await db.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_contract(
    contract: ContractCreate, current_user: dict = Depends(get_current_user)
):
    """Create a new rental contract."""
    db = await get_db()
    try:
        # Verify tenant exists
        cursor = await db.execute(
            "SELECT id FROM tenants WHERE id = ? AND is_active = 1", (contract.tenant_id,)
        )
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញអ្នកជួល")

        # Verify room is available
        cursor = await db.execute(
            "SELECT id, status FROM rooms WHERE id = ? AND is_active = 1", (contract.room_id,)
        )
        room = await cursor.fetchone()
        if not room:
            raise HTTPException(status_code=404, detail="រកមិនឃើញបន្ទប់")
        if room["status"] != "available":
            raise HTTPException(status_code=400, detail="បន្ទប់នេះមិនទំនេរទេ")

        # Check tenant doesn't have active contract
        cursor = await db.execute(
            "SELECT id FROM contracts WHERE tenant_id = ? AND status = 'active'",
            (contract.tenant_id,),
        )
        if await cursor.fetchone():
            raise HTTPException(
                status_code=400, detail="អ្នកជួលនេះមានកិច្ចសន្យាសកម្មរួចហើយ"
            )

        contract_number = generate_contract_number()
        cursor = await db.execute(
            """INSERT INTO contracts
            (tenant_id, room_id, contract_number, start_date, end_date,
             monthly_rent_usd, monthly_rent_khr, deposit_paid_usd, deposit_paid_khr,
             payment_due_day, terms, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                contract.tenant_id, contract.room_id, contract_number,
                contract.start_date, contract.end_date,
                contract.monthly_rent_usd, contract.monthly_rent_khr,
                contract.deposit_paid_usd, contract.deposit_paid_khr,
                contract.payment_due_day, contract.terms, contract.notes,
            ),
        )

        # Update room status
        await db.execute(
            "UPDATE rooms SET status = 'occupied', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (contract.room_id,),
        )

        await db.commit()
        return {
            "id": cursor.lastrowid,
            "contract_number": contract_number,
            "message": "បង្កើតកិច្ចសន្យាថ្មីបានជោគជ័យ",
        }
    finally:
        await db.close()


@router.put("/{contract_id}")
async def update_contract(
    contract_id: int,
    contract: ContractUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update contract."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, room_id, status FROM contracts WHERE id = ?", (contract_id,)
        )
        existing = await cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="រកមិនឃើញកិច្ចសន្យា")

        update_data = contract.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="គ្មានទិន្នន័យត្រូវធ្វើបច្ចុប្បន្នភាព")

        # If terminating contract, free the room
        if update_data.get("status") in ("terminated", "expired"):
            await db.execute(
                "UPDATE rooms SET status = 'available', "
                "updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (existing["room_id"],),
            )

        set_clauses = [f"{key} = ?" for key in update_data.keys()]
        set_clauses.append("updated_at = CURRENT_TIMESTAMP")
        values = list(update_data.values()) + [contract_id]

        await db.execute(
            f"UPDATE contracts SET {', '.join(set_clauses)} WHERE id = ?", values
        )
        await db.commit()
        return {"message": "ធ្វើបច្ចុប្បន្នភាពកិច្ចសន្យាបានជោគជ័យ"}
    finally:
        await db.close()
