from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.core.database import Base


class Game(Base):
    """Persisted game summary keyed directly by game id."""

    __tablename__ = "games"

    game_id = Column(String(36), primary_key=True)
    player_count = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="active")

    player_one_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    player_two_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    player_three_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    player_four_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    player_one_display_name = Column(String(100), nullable=True)
    player_two_display_name = Column(String(100), nullable=True)
    player_three_display_name = Column(String(100), nullable=True)
    player_four_display_name = Column(String(100), nullable=True)

    winner_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    winner_display_name = Column(String(100), nullable=True)
    engine_state_json = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
