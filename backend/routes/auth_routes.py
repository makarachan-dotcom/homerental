"""Authentication routes."""

from fastapi import APIRouter, Depends, HTTPException, status

from backend.auth import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from backend.database import get_db
from backend.models import ChangePasswordRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Authenticate user and return JWT token."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM users WHERE username = ? AND is_active = 1",
            (request.username,),
        )
        user = await cursor.fetchone()

        if not user or not verify_password(request.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
            )

        token = create_access_token(data={"sub": user["username"]})
        return TokenResponse(
            access_token=token,
            user={
                "id": user["id"],
                "username": user["username"],
                "full_name": user["full_name"],
                "role": user["role"],
            },
        )
    finally:
        await db.close()


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    """Change current user's password."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT password_hash FROM users WHERE id = ?",
            (current_user["id"],),
        )
        user = await cursor.fetchone()

        if not verify_password(request.current_password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវ",
            )

        new_hash = get_password_hash(request.new_password)
        await db.execute(
            "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (new_hash, current_user["id"]),
        )
        await db.commit()
        return {"message": "ប្តូរពាក្យសម្ងាត់បានជោគជ័យ"}
    finally:
        await db.close()
