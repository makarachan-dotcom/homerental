"""Dashboard and statistics routes."""

from datetime import datetime

from fastapi import APIRouter, Depends, Query

from backend.auth import get_current_user
from backend.database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard overview statistics."""
    db = await get_db()
    try:
        now = datetime.now()

        # Room stats
        cursor = await db.execute("""
            SELECT
                COUNT(*) as total_rooms,
                SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_rooms,
                SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_rooms
            FROM rooms WHERE is_active = 1
        """)
        room_stats = dict(await cursor.fetchone())

        # Tenant stats
        cursor = await db.execute(
            "SELECT COUNT(*) as total FROM tenants WHERE is_active = 1"
        )
        tenant_count = (await cursor.fetchone())["total"]

        # Active contracts
        cursor = await db.execute(
            "SELECT COUNT(*) as total FROM contracts WHERE status = 'active'"
        )
        active_contracts = (await cursor.fetchone())["total"]

        # Monthly revenue
        cursor = await db.execute(
            """SELECT
                COALESCE(SUM(amount_usd), 0) as revenue_usd,
                COALESCE(SUM(amount_khr), 0) as revenue_khr
            FROM payments
            WHERE status = 'completed'
            AND period_year = ? AND period_month = ?""",
            (now.year, now.month),
        )
        revenue = dict(await cursor.fetchone())

        # Pending payments
        cursor = await db.execute(
            "SELECT COUNT(*) as total FROM payments WHERE status = 'pending'"
        )
        pending_payments = (await cursor.fetchone())["total"]

        # Pending maintenance
        cursor = await db.execute(
            "SELECT COUNT(*) as total FROM maintenance_requests WHERE status = 'pending'"
        )
        pending_maintenance = (await cursor.fetchone())["total"]

        total_rooms = room_stats["total_rooms"] or 1
        occupancy_rate = (room_stats["occupied_rooms"] or 0) / total_rooms * 100

        return {
            "total_rooms": room_stats["total_rooms"] or 0,
            "occupied_rooms": room_stats["occupied_rooms"] or 0,
            "available_rooms": room_stats["available_rooms"] or 0,
            "maintenance_rooms": room_stats["maintenance_rooms"] or 0,
            "total_tenants": tenant_count,
            "active_contracts": active_contracts,
            "monthly_revenue_usd": revenue["revenue_usd"],
            "monthly_revenue_khr": revenue["revenue_khr"],
            "pending_payments": pending_payments,
            "pending_maintenance": pending_maintenance,
            "occupancy_rate": round(occupancy_rate, 1),
        }
    finally:
        await db.close()


@router.get("/revenue-chart")
async def get_revenue_chart(
    months: int = Query(6, ge=1, le=12),
    current_user: dict = Depends(get_current_user),
):
    """Get revenue chart data for the last N months."""
    db = await get_db()
    try:
        now = datetime.now()
        labels = []
        revenue_usd = []
        revenue_khr = []

        khmer_months = [
            "", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
            "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
        ]

        for i in range(months - 1, -1, -1):
            month = now.month - i
            year = now.year
            if month <= 0:
                month += 12
                year -= 1

            labels.append(khmer_months[month])

            cursor = await db.execute(
                """SELECT
                    COALESCE(SUM(CASE WHEN status = 'completed'
                        THEN amount_usd ELSE 0 END), 0) as usd,
                    COALESCE(SUM(CASE WHEN status = 'completed'
                        THEN amount_khr ELSE 0 END), 0) as khr
                FROM payments WHERE period_year = ? AND period_month = ?""",
                (year, month),
            )
            row = dict(await cursor.fetchone())
            revenue_usd.append(row["usd"])
            revenue_khr.append(row["khr"])

        return {
            "labels": labels,
            "revenue_usd": revenue_usd,
            "revenue_khr": revenue_khr,
        }
    finally:
        await db.close()


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    """Get recent activity for the dashboard."""
    db = await get_db()
    try:
        # Recent payments
        cursor = await db.execute(
            """SELECT p.*, t.first_name || ' ' || t.last_name as tenant_name,
                r.room_number
            FROM payments p
            LEFT JOIN tenants t ON t.id = p.tenant_id
            LEFT JOIN contracts c ON c.id = p.contract_id
            LEFT JOIN rooms r ON r.id = c.room_id
            ORDER BY p.created_at DESC LIMIT ?""",
            (limit,),
        )
        recent_payments = [dict(row) for row in await cursor.fetchall()]

        # Recent contracts
        cursor = await db.execute(
            """SELECT c.*, t.first_name || ' ' || t.last_name as tenant_name,
                r.room_number
            FROM contracts c
            LEFT JOIN tenants t ON t.id = c.tenant_id
            LEFT JOIN rooms r ON r.id = c.room_id
            ORDER BY c.created_at DESC LIMIT ?""",
            (limit,),
        )
        recent_contracts = [dict(row) for row in await cursor.fetchall()]

        # Upcoming expirations (within 30 days)
        cursor = await db.execute(
            """SELECT c.*, t.first_name || ' ' || t.last_name as tenant_name,
                r.room_number
            FROM contracts c
            LEFT JOIN tenants t ON t.id = c.tenant_id
            LEFT JOIN rooms r ON r.id = c.room_id
            WHERE c.status = 'active'
            AND c.end_date <= date('now', '+30 days')
            ORDER BY c.end_date ASC LIMIT ?""",
            (limit,),
        )
        expiring_contracts = [dict(row) for row in await cursor.fetchall()]

        return {
            "recent_payments": recent_payments,
            "recent_contracts": recent_contracts,
            "expiring_contracts": expiring_contracts,
        }
    finally:
        await db.close()


@router.get("/occupancy")
async def get_occupancy_by_floor(current_user: dict = Depends(get_current_user)):
    """Get occupancy breakdown by floor."""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT
                floor,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available
            FROM rooms
            WHERE is_active = 1
            GROUP BY floor
            ORDER BY floor
        """)
        floors = [dict(row) for row in await cursor.fetchall()]
        return {"floors": floors}
    finally:
        await db.close()
