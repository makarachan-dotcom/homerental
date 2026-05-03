"""QR code generation routes."""

import io
import json

import qrcode
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from PIL import Image
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import SolidFillColorMask
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer

from backend.auth import get_current_user
from backend.config import settings
from backend.database import get_db

router = APIRouter(prefix="/api/qr", tags=["QR Codes"])


def generate_qr_image(data: str, size: int = 300, color: str = "#1a237e") -> bytes:
    """Generate a styled QR code image."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)

    # Parse color
    r = int(color[1:3], 16)
    g = int(color[3:5], 16)
    b = int(color[5:7], 16)

    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
        color_mask=SolidFillColorMask(
            back_color=(255, 255, 255),
            front_color=(r, g, b),
        ),
    )

    # Resize
    img = img.resize((size, size), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="PNG", quality=95)
    buf.seek(0)
    return buf.getvalue()


def generate_payment_qr(
    account_name: str,
    amount: float,
    currency: str,
    room_number: str = "",
    tenant_name: str = "",
) -> bytes:
    """Generate KHQR payment QR code."""
    payment_data = {
        "type": "KHQR",
        "account": account_name,
        "bank": settings.KHQR_BANK,
        "amount": amount,
        "currency": currency,
        "reference": f"Room-{room_number}" if room_number else "",
        "tenant": tenant_name,
        "business": settings.BUSINESS_NAME,
        "location": settings.BUSINESS_LOCATION,
    }

    qr_data = json.dumps(payment_data, ensure_ascii=False)
    return generate_qr_image(qr_data, size=400, color="#c62828")


@router.get("/tenant/{tenant_id}")
async def get_tenant_qr(
    tenant_id: int,
    size: int = Query(300, ge=100, le=600),
    current_user: dict = Depends(get_current_user),
):
    """Generate QR code for tenant information."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT t.*,
                r.room_number, r.floor,
                c.contract_number, c.monthly_rent_usd, c.monthly_rent_khr,
                c.start_date, c.end_date,
                b.name as building_name, b.address
            FROM tenants t
            LEFT JOIN contracts c ON c.tenant_id = t.id AND c.status = 'active'
            LEFT JOIN rooms r ON r.id = c.room_id
            LEFT JOIN buildings b ON b.id = r.building_id
            WHERE t.id = ?""",
            (tenant_id,),
        )
        tenant = await cursor.fetchone()
        if not tenant:
            raise HTTPException(status_code=404, detail="រកមិនឃើញអ្នកជួល")

        tenant_info = {
            "type": "tenant_info",
            "business": settings.BUSINESS_NAME,
            "name": f"{tenant['first_name']} {tenant['last_name']}",
            "phone": tenant["phone"],
            "room": tenant["room_number"] or "N/A",
            "floor": tenant["floor"] or "N/A",
            "building": tenant["building_name"] or settings.BUSINESS_NAME,
            "contract": tenant["contract_number"] or "N/A",
            "rent_usd": tenant["monthly_rent_usd"] or 0,
            "rent_khr": tenant["monthly_rent_khr"] or 0,
            "start_date": tenant["start_date"] or "N/A",
            "end_date": tenant["end_date"] or "N/A",
            "location": settings.BUSINESS_LOCATION,
        }

        qr_data = json.dumps(tenant_info, ensure_ascii=False)
        qr_bytes = generate_qr_image(qr_data, size=size, color="#1a237e")

        return StreamingResponse(
            io.BytesIO(qr_bytes),
            media_type="image/png",
            headers={"Content-Disposition": f"inline; filename=tenant-{tenant_id}-qr.png"},
        )
    finally:
        await db.close()


@router.get("/room/{room_id}")
async def get_room_qr(
    room_id: int,
    size: int = Query(300, ge=100, le=600),
    current_user: dict = Depends(get_current_user),
):
    """Generate QR code for room information."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT r.*, b.name as building_name, b.address
            FROM rooms r
            LEFT JOIN buildings b ON b.id = r.building_id
            WHERE r.id = ?""",
            (room_id,),
        )
        room = await cursor.fetchone()
        if not room:
            raise HTTPException(status_code=404, detail="រកមិនឃើញបន្ទប់")

        room_info = {
            "type": "room_info",
            "business": settings.BUSINESS_NAME,
            "room_number": room["room_number"],
            "floor": room["floor"],
            "room_type": room["room_type"],
            "size_sqm": room["size_sqm"],
            "price_usd": room["price_usd"],
            "price_khr": room["price_khr"],
            "status": room["status"],
            "building": room["building_name"],
            "address": room["address"],
            "amenities": room["amenities"],
        }

        qr_data = json.dumps(room_info, ensure_ascii=False)
        qr_bytes = generate_qr_image(qr_data, size=size, color="#2e7d32")

        return StreamingResponse(
            io.BytesIO(qr_bytes),
            media_type="image/png",
            headers={"Content-Disposition": f"inline; filename=room-{room_id}-qr.png"},
        )
    finally:
        await db.close()


@router.get("/payment/{contract_id}")
async def get_payment_qr(
    contract_id: int,
    amount: float = Query(None),
    currency: str = Query("USD"),
    current_user: dict = Depends(get_current_user),
):
    """Generate KHQR payment QR code for a contract."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT c.*,
                t.first_name || ' ' || t.last_name as tenant_name,
                r.room_number
            FROM contracts c
            LEFT JOIN tenants t ON t.id = c.tenant_id
            LEFT JOIN rooms r ON r.id = c.room_id
            WHERE c.id = ?""",
            (contract_id,),
        )
        contract = await cursor.fetchone()
        if not contract:
            raise HTTPException(status_code=404, detail="រកមិនឃើញកិច្ចសន្យា")

        pay_amount = amount or (
            contract["monthly_rent_usd"] if currency == "USD" else contract["monthly_rent_khr"]
        )

        qr_bytes = generate_payment_qr(
            account_name=settings.KHQR_ACCOUNT_NAME,
            amount=pay_amount,
            currency=currency,
            room_number=contract["room_number"],
            tenant_name=contract["tenant_name"],
        )

        return StreamingResponse(
            io.BytesIO(qr_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": f"inline; filename=payment-{contract_id}-qr.png"
            },
        )
    finally:
        await db.close()


@router.get("/business")
async def get_business_qr(size: int = Query(400, ge=100, le=800)):
    """Generate business information QR code (public)."""
    business_info = {
        "type": "business",
        "name": settings.BUSINESS_NAME,
        "owner": settings.BUSINESS_OWNER,
        "location": settings.BUSINESS_LOCATION,
        "phone": settings.BUSINESS_PHONE,
        "bank": settings.KHQR_BANK,
        "account": settings.KHQR_ACCOUNT_NAME,
        "services": [
            "ផ្ទះជួលគុណភាពខ្ពស់",
            "សន្តិសុខ ២៤ម៉ោង",
            "WiFi ល្បឿនលឿន",
            "ចំណតរថយន្ត",
            "ទឹក/ភ្លើង រួមបញ្ចូល",
        ],
    }

    qr_data = json.dumps(business_info, ensure_ascii=False)
    qr_bytes = generate_qr_image(qr_data, size=size, color="#1565c0")

    return StreamingResponse(
        io.BytesIO(qr_bytes),
        media_type="image/png",
        headers={"Content-Disposition": "inline; filename=sokly-business-qr.png"},
    )


@router.get("/scan/{qr_type}/{item_id}")
async def scan_qr_info(qr_type: str, item_id: int):
    """Public endpoint for QR code scanning - returns info page data."""
    db = await get_db()
    try:
        if qr_type == "tenant":
            cursor = await db.execute(
                """SELECT t.first_name, t.last_name, t.phone,
                    r.room_number, r.floor,
                    c.start_date, c.end_date, c.monthly_rent_usd,
                    b.name as building_name, b.address
                FROM tenants t
                LEFT JOIN contracts c ON c.tenant_id = t.id AND c.status = 'active'
                LEFT JOIN rooms r ON r.id = c.room_id
                LEFT JOIN buildings b ON b.id = r.building_id
                WHERE t.id = ? AND t.is_active = 1""",
                (item_id,),
            )
            data = await cursor.fetchone()
            if not data:
                raise HTTPException(status_code=404, detail="រកមិនឃើញព័ត៌មាន")
            return {
                "type": "tenant",
                "business": settings.BUSINESS_NAME,
                "location": settings.BUSINESS_LOCATION,
                "data": dict(data),
            }

        elif qr_type == "room":
            cursor = await db.execute(
                """SELECT r.room_number, r.floor, r.room_type, r.size_sqm,
                    r.price_usd, r.price_khr, r.status, r.amenities,
                    b.name as building_name, b.address
                FROM rooms r
                LEFT JOIN buildings b ON b.id = r.building_id
                WHERE r.id = ? AND r.is_active = 1""",
                (item_id,),
            )
            data = await cursor.fetchone()
            if not data:
                raise HTTPException(status_code=404, detail="រកមិនឃើញព័ត៌មាន")
            return {
                "type": "room",
                "business": settings.BUSINESS_NAME,
                "location": settings.BUSINESS_LOCATION,
                "data": dict(data),
            }

        else:
            raise HTTPException(status_code=400, detail="ប្រភេទ QR មិនត្រឹមត្រូវ")
    finally:
        await db.close()
