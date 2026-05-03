"""Tenant management routes."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import TenantCreate, TenantUpdate

router = APIRouter(prefix="/api/tenants", tags=["Tenants"])


@router.get("")
async def list_tenants(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query("", max_length=100),
    status_filter: str = Query("all"),
    current_user: dict = Depends(get_current_user),
):
    """List all tenants with pagination and search."""
    db = await get_db()
    try:
        offset = (page - 1) * per_page
        where_clauses = []
        params = []

        if search:
            where_clauses.append(
                "(t.first_name LIKE ? OR t.last_name LIKE ? OR t.phone LIKE ? OR t.email LIKE ?)"
            )
            search_param = f"%{search}%"
            params.extend([search_param] * 4)

        if status_filter == "active":
            where_clauses.append("t.is_active = 1")
        elif status_filter == "inactive":
            where_clauses.append("t.is_active = 0")

        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        # Get total count
        count_cursor = await db.execute(
            f"SELECT COUNT(*) as total FROM tenants t {where_sql}", params
        )
        total = (await count_cursor.fetchone())["total"]

        # Get tenants with contract info
        cursor = await db.execute(
            f"""SELECT t.*,
                r.room_number,
                c.status as contract_status
            FROM tenants t
            LEFT JOIN contracts c ON c.tenant_id = t.id AND c.status = 'active'
            LEFT JOIN rooms r ON r.id = c.room_id
            {where_sql}
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?""",
            params + [per_page, offset],
        )
        tenants = [dict(row) for row in await cursor.fetchall()]

        return {
            "data": tenants,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
        }
    finally:
        await db.close()


@router.get("/{tenant_id}")
async def get_tenant(tenant_id: int, current_user: dict = Depends(get_current_user)):
    """Get tenant details."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT t.*,
                r.room_number,
                c.status as contract_status,
                c.id as contract_id,
                c.monthly_rent_usd,
                c.monthly_rent_khr,
                c.start_date as contract_start,
                c.end_date as contract_end
            FROM tenants t
            LEFT JOIN contracts c ON c.tenant_id = t.id AND c.status = 'active'
            LEFT JOIN rooms r ON r.id = c.room_id
            WHERE t.id = ?""",
            (tenant_id,),
        )
        tenant = await cursor.fetchone()
        if not tenant:
            raise HTTPException(status_code=404, detail="រកមិនឃើញអ្នកជួល")
        return dict(tenant)
    finally:
        await db.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant: TenantCreate, current_user: dict = Depends(get_current_user)
):
    """Create a new tenant."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """INSERT INTO tenants
            (first_name, last_name, phone, email, id_card_number,
             date_of_birth, gender, nationality, occupation, workplace,
             emergency_contact_name, emergency_contact_phone, emergency_contact_relation, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                tenant.first_name, tenant.last_name, tenant.phone, tenant.email,
                tenant.id_card_number, tenant.date_of_birth, tenant.gender,
                tenant.nationality, tenant.occupation, tenant.workplace,
                tenant.emergency_contact_name, tenant.emergency_contact_phone,
                tenant.emergency_contact_relation, tenant.notes,
            ),
        )
        await db.commit()
        return {"id": cursor.lastrowid, "message": "បង្កើតអ្នកជួលថ្មីបានជោគជ័យ"}
    finally:
        await db.close()


@router.put("/{tenant_id}")
async def update_tenant(
    tenant_id: int,
    tenant: TenantUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update tenant information."""
    db = await get_db()
    try:
        # Check tenant exists
        cursor = await db.execute("SELECT id FROM tenants WHERE id = ?", (tenant_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញអ្នកជួល")

        update_data = tenant.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="គ្មានទិន្នន័យត្រូវធ្វើបច្ចុប្បន្នភាព")

        set_clauses = [f"{key} = ?" for key in update_data.keys()]
        set_clauses.append("updated_at = CURRENT_TIMESTAMP")
        values = list(update_data.values()) + [tenant_id]

        await db.execute(
            f"UPDATE tenants SET {', '.join(set_clauses)} WHERE id = ?", values
        )
        await db.commit()
        return {"message": "ធ្វើបច្ចុប្បន្នភាពអ្នកជួលបានជោគជ័យ"}
    finally:
        await db.close()


@router.delete("/{tenant_id}")
async def delete_tenant(tenant_id: int, current_user: dict = Depends(get_current_user)):
    """Soft delete a tenant."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM tenants WHERE id = ?", (tenant_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញអ្នកជួល")

        # Check active contracts
        cursor = await db.execute(
            "SELECT id FROM contracts WHERE tenant_id = ? AND status = 'active'",
            (tenant_id,),
        )
        if await cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="មិនអាចលុបអ្នកជួលដែលមានកិច្ចសន្យាសកម្មបានទេ",
            )

        await db.execute(
            "UPDATE tenants SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (tenant_id,),
        )
        await db.commit()
        return {"message": "លុបអ្នកជួលបានជោគជ័យ"}
    finally:
        await db.close()
