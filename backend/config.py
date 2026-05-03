"""Application configuration and settings."""

import os
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "សុខលីផ្ទះជួល"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "ប្រព័ន្ធគ្រប់គ្រងផ្ទះជួលឌីជីថល"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = os.environ.get(
        "SECRET_KEY", "sokly-rental-secret-key-change-in-production-2024"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/sokly_rental.db"
    DATABASE_PATH: Path = Path("./data/sokly_rental.db")

    # Business Info
    BUSINESS_NAME: str = "សុខលីផ្ទះជួល"
    BUSINESS_LOCATION: str = "Domnak Thom 5, Phnom Penh, Cambodia"
    BUSINESS_PHONE: str = "023 994 444"
    BUSINESS_OWNER: str = "ចាន់ មករា"

    # Payment
    KHQR_ACCOUNT_NAME: str = "ចាន់ មករា"
    KHQR_BANK: str = "ACLEDA Bank"
    CURRENCY_KHR: str = "KHR"
    CURRENCY_USD: str = "USD"

    # File Upload
    UPLOAD_DIR: Path = Path("./uploads")
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
