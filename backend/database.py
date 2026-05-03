"""Database connection and session management."""


import aiosqlite

from backend.config import settings

DB_PATH = settings.DATABASE_PATH


async def get_db() -> aiosqlite.Connection:
    """Get database connection."""
    db = await aiosqlite.connect(str(DB_PATH))
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db


async def init_db():
    """Initialize database tables."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    db = await aiosqlite.connect(str(DB_PATH))
    db.row_factory = aiosqlite.Row

    await db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'staff',
            phone TEXT,
            email TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS buildings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            description TEXT,
            total_rooms INTEGER NOT NULL DEFAULT 0,
            floors INTEGER NOT NULL DEFAULT 1,
            amenities TEXT,
            image_url TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            building_id INTEGER NOT NULL,
            room_number TEXT NOT NULL,
            floor INTEGER NOT NULL DEFAULT 1,
            room_type TEXT NOT NULL DEFAULT 'standard',
            size_sqm REAL,
            price_usd REAL NOT NULL DEFAULT 0,
            price_khr REAL NOT NULL DEFAULT 0,
            deposit_usd REAL NOT NULL DEFAULT 0,
            deposit_khr REAL NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'available',
            description TEXT,
            amenities TEXT,
            image_url TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS tenants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            id_card_number TEXT,
            id_card_image TEXT,
            date_of_birth TEXT,
            gender TEXT,
            nationality TEXT DEFAULT 'កម្ពុជា',
            occupation TEXT,
            workplace TEXT,
            emergency_contact_name TEXT,
            emergency_contact_phone TEXT,
            emergency_contact_relation TEXT,
            profile_image TEXT,
            notes TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS contracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id INTEGER NOT NULL,
            room_id INTEGER NOT NULL,
            contract_number TEXT UNIQUE NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            monthly_rent_usd REAL NOT NULL DEFAULT 0,
            monthly_rent_khr REAL NOT NULL DEFAULT 0,
            deposit_paid_usd REAL NOT NULL DEFAULT 0,
            deposit_paid_khr REAL NOT NULL DEFAULT 0,
            payment_due_day INTEGER NOT NULL DEFAULT 5,
            status TEXT NOT NULL DEFAULT 'active',
            terms TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_id INTEGER NOT NULL,
            tenant_id INTEGER NOT NULL,
            amount_usd REAL NOT NULL DEFAULT 0,
            amount_khr REAL NOT NULL DEFAULT 0,
            currency TEXT NOT NULL DEFAULT 'USD',
            payment_type TEXT NOT NULL DEFAULT 'rent',
            payment_method TEXT NOT NULL DEFAULT 'cash',
            payment_date TEXT NOT NULL,
            due_date TEXT,
            period_month INTEGER,
            period_year INTEGER,
            transaction_ref TEXT,
            receipt_number TEXT UNIQUE,
            status TEXT NOT NULL DEFAULT 'completed',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS utilities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_id INTEGER NOT NULL,
            room_id INTEGER NOT NULL,
            period_month INTEGER NOT NULL,
            period_year INTEGER NOT NULL,
            electricity_previous REAL NOT NULL DEFAULT 0,
            electricity_current REAL NOT NULL DEFAULT 0,
            electricity_usage REAL NOT NULL DEFAULT 0,
            electricity_rate REAL NOT NULL DEFAULT 0,
            electricity_amount REAL NOT NULL DEFAULT 0,
            water_previous REAL NOT NULL DEFAULT 0,
            water_current REAL NOT NULL DEFAULT 0,
            water_usage REAL NOT NULL DEFAULT 0,
            water_rate REAL NOT NULL DEFAULT 0,
            water_amount REAL NOT NULL DEFAULT 0,
            internet_amount REAL NOT NULL DEFAULT 0,
            garbage_amount REAL NOT NULL DEFAULT 0,
            other_amount REAL NOT NULL DEFAULT 0,
            total_amount REAL NOT NULL DEFAULT 0,
            currency TEXT NOT NULL DEFAULT 'USD',
            status TEXT NOT NULL DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS maintenance_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            tenant_id INTEGER,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            priority TEXT NOT NULL DEFAULT 'normal',
            status TEXT NOT NULL DEFAULT 'pending',
            assigned_to TEXT,
            estimated_cost REAL,
            actual_cost REAL,
            resolution_notes TEXT,
            reported_date TEXT NOT NULL,
            resolved_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            tenant_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'info',
            is_read INTEGER NOT NULL DEFAULT 0,
            link TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id INTEGER,
            details TEXT,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            amount_usd REAL NOT NULL DEFAULT 0,
            amount_khr REAL NOT NULL DEFAULT 0,
            expense_date TEXT NOT NULL,
            building_id INTEGER,
            vendor TEXT,
            receipt_number TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
        CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

        CREATE TABLE IF NOT EXISTS settings_table (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL,
            description TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for performance
        CREATE INDEX IF NOT EXISTS idx_rooms_building ON rooms(building_id);
        CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
        CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON contracts(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_contracts_room ON contracts(room_id);
        CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
        CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);
        CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
        CREATE INDEX IF NOT EXISTS idx_utilities_contract ON utilities(contract_id);
        CREATE INDEX IF NOT EXISTS idx_utilities_period ON utilities(period_month, period_year);
        CREATE INDEX IF NOT EXISTS idx_maintenance_room ON maintenance_requests(room_id);
        CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
        CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
    """)

    await db.commit()
    await db.close()


async def seed_default_data():
    """Seed initial default data."""
    db = await aiosqlite.connect(str(DB_PATH))
    db.row_factory = aiosqlite.Row

    # Check if admin user exists
    cursor = await db.execute("SELECT id FROM users WHERE username = 'admin'")
    admin = await cursor.fetchone()

    if not admin:
        from backend.auth import get_password_hash

        admin_hash = get_password_hash("admin123")
        await db.execute(
            """INSERT INTO users (username, password_hash, full_name, role, phone)
            VALUES (?, ?, ?, ?, ?)""",
            ("admin", admin_hash, "ចាន់ មករា", "admin", "023 994 444"),
        )

        # Insert default building
        await db.execute(
            """INSERT INTO buildings (name, address, description, total_rooms, floors, amenities)
            VALUES (?, ?, ?, ?, ?, ?)""",
            (
                "សុខលីផ្ទះជួល",
                "Domnak Thom 5, Phnom Penh, Cambodia",
                "ផ្ទះជួលគុណភាពខ្ពស់ ទីតាំងល្អ សុវត្ថិភាពខ្ពស់",
                20,
                3,
                "WiFi,ទឹក,ភ្លើង,សន្តិសុខ២៤ម៉ោង,ចំណតរថយន្ត",
            ),
        )

        # Insert sample rooms
        room_types = ["standard", "deluxe", "suite"]
        for floor in range(1, 4):
            for room in range(1, 8):
                room_type = room_types[min(floor - 1, 2)]
                price_usd = 80 + (floor * 20) + (room * 5)
                price_khr = price_usd * 4100
                await db.execute(
                    """INSERT INTO rooms
                    (building_id, room_number, floor, room_type, size_sqm,
                     price_usd, price_khr, deposit_usd, deposit_khr, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        1,
                        f"{floor}0{room}",
                        floor,
                        room_type,
                        25 + (floor * 5),
                        price_usd,
                        price_khr,
                        price_usd,
                        price_khr,
                        "available" if room % 3 != 0 else "occupied",
                    ),
                )

        # Insert sample tenants
        sample_tenants = [
            ("សុភា", "វណ្ណ", "012 345 678", "sopheavan@email.com", "ស្រី", "គ្រូបង្រៀន"),
            ("រិទ្ធី", "ចន្ទ", "098 765 432", "rithy.chan@email.com", "ប្រុស", "វិស្វករ"),
            ("មាលា", "សុខ", "077 123 456", "melea.sok@email.com", "ស្រី", "គណនេយ្យករ"),
            ("វិចិត្រ", "កែវ", "085 987 654", "vichet.keo@email.com", "ប្រុស", "អាជីវករ"),
            ("ស្រីពេជ្រ", "ឡុង", "010 555 888", "sreypich@email.com", "ស្រី", "វេជ្ជបណ្ឌិត"),
        ]
        for first, last, phone, email, gender, occ in sample_tenants:
            await db.execute(
                """INSERT INTO tenants
                (first_name, last_name, phone, email, gender, occupation, nationality)
                VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (first, last, phone, email, gender, occ, "កម្ពុជា"),
            )

        # Insert sample contracts
        await db.execute(
            """INSERT INTO contracts
            (tenant_id, room_id, contract_number, start_date, end_date,
             monthly_rent_usd, monthly_rent_khr, deposit_paid_usd, deposit_paid_khr,
             payment_due_day, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (1, 3, "CTR-2024-001", "2024-01-15", "2025-01-14",
             105, 430500, 105, 430500, 5, "active"),
        )
        await db.execute(
            """INSERT INTO contracts
            (tenant_id, room_id, contract_number, start_date, end_date,
             monthly_rent_usd, monthly_rent_khr, deposit_paid_usd, deposit_paid_khr,
             payment_due_day, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (2, 6, "CTR-2024-002", "2024-02-01", "2025-01-31",
             125, 512500, 125, 512500, 5, "active"),
        )
        await db.execute(
            """INSERT INTO contracts
            (tenant_id, room_id, contract_number, start_date, end_date,
             monthly_rent_usd, monthly_rent_khr, deposit_paid_usd, deposit_paid_khr,
             payment_due_day, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (3, 9, "CTR-2024-003", "2024-03-01", "2025-02-28",
             145, 594500, 145, 594500, 5, "active"),
        )

        # Insert sample payments
        for month in range(1, 5):
            await db.execute(
                """INSERT INTO payments
                (contract_id, tenant_id, amount_usd, amount_khr, currency,
                 payment_type, payment_method, payment_date, period_month, period_year,
                 receipt_number, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    1, 1, 105, 430500, "USD", "rent", "bank_transfer",
                    f"2024-{month:02d}-05", month, 2024,
                    f"RCP-2024-{month:03d}", "completed",
                ),
            )

        # Insert default settings
        default_settings = [
            ("electricity_rate", "610", "តម្លៃភ្លើងក្នុង១គីឡូវ៉ាត់ (រៀល)"),
            ("water_rate", "1500", "តម្លៃទឹកក្នុង១ម៉ែត្រគូប (រៀល)"),
            ("internet_monthly", "10", "តម្លៃអ៊ីនធើណិតប្រចាំខែ (ដុល្លារ)"),
            ("garbage_monthly", "2", "តម្លៃសេវាសំរាមប្រចាំខែ (ដុល្លារ)"),
            ("exchange_rate", "4100", "អត្រាប្តូរប្រាក់ ១ដុល្លារ = រៀល"),
            ("late_fee_percent", "5", "ពិន័យបង់ប្រាក់យឺត (%)"),
            ("late_fee_days", "7", "ចំនួនថ្ងៃមុនពិន័យ"),
        ]
        for key, value, desc in default_settings:
            await db.execute(
                "INSERT INTO settings_table (key, value, description) VALUES (?, ?, ?)",
                (key, value, desc),
            )

    await db.commit()
    await db.close()
