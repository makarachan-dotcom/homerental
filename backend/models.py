"""Pydantic models for request/response validation."""

from typing import Optional

from pydantic import BaseModel, Field


# ============ Auth Models ============
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


# ============ User Models ============
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)
    full_name: str
    role: str = "staff"
    phone: Optional[str] = None
    email: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None


# ============ Building Models ============
class BuildingCreate(BaseModel):
    name: str
    address: str
    description: Optional[str] = None
    total_rooms: int = 0
    floors: int = 1
    amenities: Optional[str] = None
    image_url: Optional[str] = None


class BuildingUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    total_rooms: Optional[int] = None
    floors: Optional[int] = None
    amenities: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class BuildingResponse(BaseModel):
    id: int
    name: str
    address: str
    description: Optional[str] = None
    total_rooms: int
    floors: int
    amenities: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None


# ============ Room Models ============
class RoomCreate(BaseModel):
    building_id: int
    room_number: str
    floor: int = 1
    room_type: str = "standard"
    size_sqm: Optional[float] = None
    price_usd: float = 0
    price_khr: float = 0
    deposit_usd: float = 0
    deposit_khr: float = 0
    description: Optional[str] = None
    amenities: Optional[str] = None
    image_url: Optional[str] = None


class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    floor: Optional[int] = None
    room_type: Optional[str] = None
    size_sqm: Optional[float] = None
    price_usd: Optional[float] = None
    price_khr: Optional[float] = None
    deposit_usd: Optional[float] = None
    deposit_khr: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None
    amenities: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class RoomResponse(BaseModel):
    id: int
    building_id: int
    room_number: str
    floor: int
    room_type: str
    size_sqm: Optional[float] = None
    price_usd: float
    price_khr: float
    deposit_usd: float
    deposit_khr: float
    status: str
    description: Optional[str] = None
    amenities: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None
    building_name: Optional[str] = None
    tenant_name: Optional[str] = None


# ============ Tenant Models ============
class TenantCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: Optional[str] = None
    id_card_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: str = "កម្ពុជា"
    occupation: Optional[str] = None
    workplace: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    notes: Optional[str] = None


class TenantUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    id_card_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    occupation: Optional[str] = None
    workplace: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class TenantResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    phone: str
    email: Optional[str] = None
    id_card_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    occupation: Optional[str] = None
    workplace: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    profile_image: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None
    room_number: Optional[str] = None
    contract_status: Optional[str] = None


# ============ Contract Models ============
class ContractCreate(BaseModel):
    tenant_id: int
    room_id: int
    start_date: str
    end_date: str
    monthly_rent_usd: float = 0
    monthly_rent_khr: float = 0
    deposit_paid_usd: float = 0
    deposit_paid_khr: float = 0
    payment_due_day: int = 5
    terms: Optional[str] = None
    notes: Optional[str] = None


class ContractUpdate(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    monthly_rent_usd: Optional[float] = None
    monthly_rent_khr: Optional[float] = None
    deposit_paid_usd: Optional[float] = None
    deposit_paid_khr: Optional[float] = None
    payment_due_day: Optional[int] = None
    status: Optional[str] = None
    terms: Optional[str] = None
    notes: Optional[str] = None


class ContractResponse(BaseModel):
    id: int
    tenant_id: int
    room_id: int
    contract_number: str
    start_date: str
    end_date: str
    monthly_rent_usd: float
    monthly_rent_khr: float
    deposit_paid_usd: float
    deposit_paid_khr: float
    payment_due_day: int
    status: str
    terms: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None
    tenant_name: Optional[str] = None
    room_number: Optional[str] = None


# ============ Payment Models ============
class PaymentCreate(BaseModel):
    contract_id: int
    tenant_id: int
    amount_usd: float = 0
    amount_khr: float = 0
    currency: str = "USD"
    payment_type: str = "rent"
    payment_method: str = "cash"
    payment_date: str
    due_date: Optional[str] = None
    period_month: Optional[int] = None
    period_year: Optional[int] = None
    transaction_ref: Optional[str] = None
    notes: Optional[str] = None


class PaymentUpdate(BaseModel):
    amount_usd: Optional[float] = None
    amount_khr: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: int
    contract_id: int
    tenant_id: int
    amount_usd: float
    amount_khr: float
    currency: str
    payment_type: str
    payment_method: str
    payment_date: str
    due_date: Optional[str] = None
    period_month: Optional[int] = None
    period_year: Optional[int] = None
    transaction_ref: Optional[str] = None
    receipt_number: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: Optional[str] = None
    tenant_name: Optional[str] = None
    room_number: Optional[str] = None


# ============ Utility Models ============
class UtilityCreate(BaseModel):
    contract_id: int
    room_id: int
    period_month: int
    period_year: int
    electricity_previous: float = 0
    electricity_current: float = 0
    electricity_rate: float = 610
    water_previous: float = 0
    water_current: float = 0
    water_rate: float = 1500
    internet_amount: float = 0
    garbage_amount: float = 0
    other_amount: float = 0
    currency: str = "KHR"
    notes: Optional[str] = None


class UtilityResponse(BaseModel):
    id: int
    contract_id: int
    room_id: int
    period_month: int
    period_year: int
    electricity_previous: float
    electricity_current: float
    electricity_usage: float
    electricity_rate: float
    electricity_amount: float
    water_previous: float
    water_current: float
    water_usage: float
    water_rate: float
    water_amount: float
    internet_amount: float
    garbage_amount: float
    other_amount: float
    total_amount: float
    currency: str
    status: str
    notes: Optional[str] = None
    created_at: Optional[str] = None
    room_number: Optional[str] = None


# ============ Maintenance Models ============
class MaintenanceCreate(BaseModel):
    room_id: int
    tenant_id: Optional[int] = None
    title: str
    description: str
    priority: str = "normal"
    assigned_to: Optional[str] = None
    estimated_cost: Optional[float] = None
    reported_date: str


class MaintenanceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    resolution_notes: Optional[str] = None
    resolved_date: Optional[str] = None


class MaintenanceResponse(BaseModel):
    id: int
    room_id: int
    tenant_id: Optional[int] = None
    title: str
    description: str
    priority: str
    status: str
    assigned_to: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    resolution_notes: Optional[str] = None
    reported_date: str
    resolved_date: Optional[str] = None
    created_at: Optional[str] = None
    room_number: Optional[str] = None
    tenant_name: Optional[str] = None


# ============ Expense Models ============
class ExpenseCreate(BaseModel):
    category: str
    description: str
    amount_usd: float = 0
    amount_khr: float = 0
    expense_date: str
    building_id: Optional[int] = None
    vendor: Optional[str] = None
    receipt_number: Optional[str] = None
    notes: Optional[str] = None


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    amount_usd: Optional[float] = None
    amount_khr: Optional[float] = None
    expense_date: Optional[str] = None
    building_id: Optional[int] = None
    vendor: Optional[str] = None
    receipt_number: Optional[str] = None
    notes: Optional[str] = None


# ============ Dashboard Models ============
class DashboardStats(BaseModel):
    total_rooms: int
    occupied_rooms: int
    available_rooms: int
    total_tenants: int
    active_contracts: int
    monthly_revenue_usd: float
    monthly_revenue_khr: float
    pending_payments: int
    pending_maintenance: int
    occupancy_rate: float


class RevenueChart(BaseModel):
    labels: list[str]
    revenue_usd: list[float]
    revenue_khr: list[float]


# ============ Settings Models ============
class SettingUpdate(BaseModel):
    value: str


class SettingResponse(BaseModel):
    id: int
    key: str
    value: str
    description: Optional[str] = None
    updated_at: Optional[str] = None
