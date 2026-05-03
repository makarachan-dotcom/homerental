# សុខលីផ្ទះជួល - ប្រព័ន្ធគ្រប់គ្រងផ្ទះជួលឌីជីថល

Premium Home Rental Management System for **សុខលីផ្ទះជួល** located at Domnak Thom 5, Phnom Penh, Cambodia.

## Features

### Core Management
- **Room Management** — Track all rooms across buildings, floors, and types
- **Tenant Management** — Complete tenant profiles with ID, contacts, emergency info
- **Contract Management** — Create, track, and manage rental agreements
- **Payment Tracking** — Record payments in USD and KHR with receipt generation
- **Utility Billing** — Electricity, water, internet, garbage tracking
- **Maintenance Requests** — Priority-based repair/maintenance system

### Special Features
- **QR Code System** — Generate QR codes for tenants, rooms, and payment info
- **KHQR Payment** — Integrated KHQR payment QR code (ACLEDA Bank)
- **Dashboard Analytics** — Revenue charts, occupancy rates, activity timeline
- **Dual Currency** — Support for both USD and KHR (Cambodian Riel)
- **Premium UI** — Animated, responsive, modern design
- **100% Khmer Language** — Full Khmer localization throughout

### Security
- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (Admin/Staff)
- Session expiration (24h)
- SQL injection prevention
- XSS protection

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, SQLite (aiosqlite)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Auth:** JWT (python-jose), bcrypt (passlib)
- **QR:** qrcode library with PIL styling
- **Charts:** Chart.js

## Quick Start

```bash
# Install dependencies
pip install -e .

# Run the application
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Default admin credentials
# Username: admin
# Password: admin123
```

## Project Structure

```
sokly-house-rental/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Application settings
│   ├── database.py          # SQLite connection & migrations
│   ├── auth.py              # Authentication utilities
│   ├── models.py            # Pydantic schemas
│   └── routes/
│       ├── auth_routes.py
│       ├── dashboard_routes.py
│       ├── room_routes.py
│       ├── tenant_routes.py
│       ├── contract_routes.py
│       ├── payment_routes.py
│       ├── utility_routes.py
│       ├── maintenance_routes.py
│       ├── qr_routes.py
│       └── settings_routes.py
├── frontend/
│   ├── templates/
│   │   ├── index.html       # Main SPA template
│   │   ├── login.html       # Login page
│   │   └── scan.html        # Public QR scan page
│   └── static/
│       ├── css/
│       │   ├── main.css         # Core styles
│       │   ├── components.css   # Component styles
│       │   └── animations.css   # Animations & effects
│       └── js/
│           ├── api.js           # API client
│           ├── utils.js         # Utility functions
│           ├── components.js    # UI components
│           ├── app.js           # Main app controller
│           └── pages/
│               ├── dashboard.js
│               ├── rooms.js
│               ├── tenants.js
│               ├── contracts.js
│               ├── payments.js
│               ├── utilities.js
│               ├── maintenance.js
│               ├── qrcodes.js
│               └── settings.js
├── pyproject.toml
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| GET | /api/dashboard/stats | Dashboard statistics |
| GET | /api/rooms | List rooms |
| GET | /api/tenants | List tenants |
| GET | /api/contracts | List contracts |
| GET | /api/payments | List payments |
| GET | /api/utilities | List utility bills |
| GET | /api/maintenance | List maintenance requests |
| GET | /api/qr/business | Business QR code |
| GET | /api/qr/tenant/{id} | Tenant QR code |
| GET | /api/qr/room/{id} | Room QR code |
| GET | /api/qr/payment/{id} | Payment QR code |

## Business Information

- **Name:** សុខលីផ្ទះជួល
- **Owner:** ចាន់ មករា
- **Location:** Domnak Thom 5, Phnom Penh, Cambodia
- **Bank:** ACLEDA Bank (KHQR)
- **Phone:** 023 994 444

## License

Proprietary - All rights reserved.
