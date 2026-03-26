import os
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Use a local SQLite database by default to avoid needing a separate DB server
    # and native drivers (like asyncpg) during local development.
    database_url: str = "sqlite+aiosqlite:///./ludo.db"
    db_auto_create: bool = True
    app_env: str = "development"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if isinstance(value, str) and os.name == "nt" and value.startswith("postgresql+psycopg://"):
            normalized = value.replace("postgresql+psycopg://", "postgresql+asyncpg://", 1)
            parsed = urlsplit(normalized)
            query_pairs = []
            for key, query_value in parse_qsl(parsed.query, keep_blank_values=True):
                if key == "connect_timeout":
                    continue
                query_pairs.append((key, query_value))
            return urlunsplit(parsed._replace(query=urlencode(query_pairs)))
        return value

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
