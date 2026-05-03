"""Settings management routes."""

from fastapi import APIRouter, Depends, HTTPException

from backend.auth import get_current_admin, get_current_user, get_password_hash
from backend.database import get_db
from backend.models import SettingUpdate, UserCreate, UserUpdate

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("")
async def list_settings(current_user: dict = Depends(get_current_user)):
    """Get all application settings."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM settings_table ORDER BY key")
        settings_list = [dict(row) for row in await cursor.fetchall()]
        return {"data": settings_list}
    finally:
        await db.close()


@router.put("/{key}")
async def update_setting(
    key: str, setting: SettingUpdate, current_user: dict = Depends(get_current_admin)
):
    """Update a setting value (admin only)."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id FROM settings_table WHERE key = ?", (key,)
        )
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញការកំណត់")

        await db.execute(
            "UPDATE settings_table SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?",
            (setting.value, key),
        )
        await db.commit()
        return {"message": "ធ្វើបច្ចុប្បន្នភាពការកំណត់បានជោគជ័យ"}
    finally:
        await db.close()


# User management (admin only)
@router.get("/users")
async def list_users(current_user: dict = Depends(get_current_admin)):
    """List all users (admin only)."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, username, full_name, role, phone, email, "
            "is_active, created_at FROM users ORDER BY created_at DESC"
        )
        users = [dict(row) for row in await cursor.fetchall()]
        return {"data": users}
    finally:
        await db.close()


@router.post("/users")
async def create_user(user: UserCreate, current_user: dict = Depends(get_current_admin)):
    """Create a new user (admin only)."""
    db = await get_db()
    try:
        # Check username unique
        cursor = await db.execute(
            "SELECT id FROM users WHERE username = ?", (user.username,)
        )
        if await cursor.fetchone():
            raise HTTPException(status_code=400, detail="ឈ្មោះអ្នកប្រើនេះមានរួចហើយ")

        password_hash = get_password_hash(user.password)
        cursor = await db.execute(
            """INSERT INTO users (username, password_hash, full_name, role, phone, email)
            VALUES (?, ?, ?, ?, ?, ?)""",
            (user.username, password_hash, user.full_name, user.role, user.phone, user.email),
        )
        await db.commit()
        return {"id": cursor.lastrowid, "message": "បង្កើតអ្នកប្រើថ្មីបានជោគជ័យ"}
    finally:
        await db.close()


@router.put("/users/{user_id}")
async def update_user(
    user_id: int, user: UserUpdate, current_user: dict = Depends(get_current_admin)
):
    """Update a user (admin only)."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="រកមិនឃើញអ្នកប្រើ")

        update_data = user.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="គ្មានទិន្នន័យត្រូវធ្វើបច្ចុប្បន្នភាព")

        set_clauses = [f"{key} = ?" for key in update_data.keys()]
        set_clauses.append("updated_at = CURRENT_TIMESTAMP")
        values = list(update_data.values()) + [user_id]

        await db.execute(
            f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?", values
        )
        await db.commit()
        return {"message": "ធ្វើបច្ចុប្បន្នភាពអ្នកប្រើបានជោគជ័យ"}
    finally:
        await db.close()


@router.get("/buildings")
async def list_buildings(current_user: dict = Depends(get_current_user)):
    """List all buildings."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM buildings WHERE is_active = 1 ORDER BY name"
        )
        buildings = [dict(row) for row in await cursor.fetchall()]
        return {"data": buildings}
    finally:
        await db.close()
