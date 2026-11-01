from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Philosopher(Base):
    __tablename__ = "philosophers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    school = Column(String(100), nullable=False)
    image = Column(String(255), nullable=False)
    face_image = Column(Text, nullable=True)
    position_x = Column(Integer, nullable=False, default=400)
    position_y = Column(Integer, nullable=False, default=300)
    years = Column(String(50), nullable=True)

    # Relationship to wisdom entries
    wisdom_entries = relationship("Wisdom", back_populates="philosopher", cascade="all, delete-orphan")


class Wisdom(Base):
    __tablename__ = "wisdom"

    id = Column(Integer, primary_key=True, index=True)
    philosopher_id = Column(Integer, ForeignKey("philosophers.id", ondelete="CASCADE"), nullable=False)
    quote = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    source = Column(Text, nullable=True)

    # Relationship to philosopher
    philosopher = relationship("Philosopher", back_populates="wisdom_entries")
