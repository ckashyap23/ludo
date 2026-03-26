from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class GameRecord(Base):
    """Persisted summary of a game session."""

    __tablename__ = "game_records"

    game_id = Column(String(36), primary_key=True)
    player_count = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="active")

    winner_color = Column(String(20), nullable=True)
    winner_display_name = Column(String(100), nullable=True)
    engine_state_json = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)

    participants = relationship("GameParticipant", back_populates="game", cascade="all, delete-orphan")


class GameParticipant(Base):
    """A player slot in a recorded game."""

    __tablename__ = "game_participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(String(36), ForeignKey("game_records.game_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    player_index = Column(Integer, nullable=False)
    display_name = Column(String(100), nullable=False)
    color = Column(String(20), nullable=False)
    is_winner = Column(Integer, nullable=False, default=0)

    game = relationship("GameRecord", back_populates="participants")
