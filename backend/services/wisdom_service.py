import random
from typing import Optional, List
from sqlalchemy.orm import Session
from models import Philosopher, Wisdom
from schemas import (
    WisdomRandomResponse,
    PhilosopherCreate,
    PhilosopherUpdate,
    WisdomCreate,
    WisdomUpdate
)

class WisdomService:
    @staticmethod
    def get_all_philosophers(db: Session) -> List[Philosopher]:
        return db.query(Philosopher).all()

    @staticmethod
    def get_philosopher_by_id(db: Session, philosopher_id: int) -> Optional[Philosopher]:
        return db.query(Philosopher).filter(Philosopher.id == philosopher_id).first()

    @staticmethod
    def get_random_wisdom(
        db: Session,
        philosopher_id: int,
        exclude_id: Optional[int] = None
    ) -> Optional[WisdomRandomResponse]:
        philosopher = db.query(Philosopher).filter(Philosopher.id == philosopher_id).first()
        if not philosopher:
            return None

        query = db.query(Wisdom).filter(Wisdom.philosopher_id == philosopher_id)
        if exclude_id is not None:
            # Try to exclude the previous quote
            filtered_query = query.filter(Wisdom.id != exclude_id)
            entries = filtered_query.all()
            if not entries:
                # If only 1 entry or filtered out everything, fall back to all entries
                entries = query.all()
        else:
            entries = query.all()

        if not entries:
            return None

        chosen: Wisdom = random.choice(entries)
        return WisdomRandomResponse(
            id=chosen.id,
            philosopher_id=chosen.philosopher_id,
            philosopher_name=philosopher.name,
            quote=chosen.quote,
            explanation=chosen.explanation,
            source=chosen.source
        )

    @staticmethod
    def get_all_wisdom_for_philosopher(db: Session, philosopher_id: int) -> List[Wisdom]:
        return db.query(Wisdom).filter(Wisdom.philosopher_id == philosopher_id).all()

    @staticmethod
    def get_stats(db: Session):
        p_count = db.query(Philosopher).count()
        w_count = db.query(Wisdom).count()
        return p_count, w_count

    # --- Admin CRUD: Philosophers ---
    @staticmethod
    def create_philosopher(db: Session, data: PhilosopherCreate) -> Philosopher:
        philosopher = Philosopher(
            name=data.name.strip(),
            description=data.description.strip(),
            school=data.school.strip(),
            image=data.image.strip() or "socrates.png",
            face_image=data.face_image.strip() if data.face_image else None,
            position_x=data.position_x,
            position_y=data.position_y,
            years=data.years.strip() if data.years else "Contemporary Era"
        )
        db.add(philosopher)
        db.commit()
        db.refresh(philosopher)
        return philosopher

    @staticmethod
    def update_philosopher(db: Session, philosopher_id: int, data: PhilosopherUpdate) -> Optional[Philosopher]:
        philosopher = db.query(Philosopher).filter(Philosopher.id == philosopher_id).first()
        if not philosopher:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None:
                setattr(philosopher, key, value)

        db.commit()
        db.refresh(philosopher)
        return philosopher

    @staticmethod
    def delete_philosopher(db: Session, philosopher_id: int) -> bool:
        philosopher = db.query(Philosopher).filter(Philosopher.id == philosopher_id).first()
        if not philosopher:
            return False
        db.delete(philosopher)
        db.commit()
        return True

    # --- Admin CRUD: Wisdom ---
    @staticmethod
    def create_wisdom(db: Session, philosopher_id: int, data: WisdomCreate) -> Optional[Wisdom]:
        philosopher = db.query(Philosopher).filter(Philosopher.id == philosopher_id).first()
        if not philosopher:
            return None

        wisdom = Wisdom(
            philosopher_id=philosopher_id,
            quote=data.quote.strip(),
            explanation=data.explanation.strip(),
            source=data.source.strip() if data.source else None
        )
        db.add(wisdom)
        db.commit()
        db.refresh(wisdom)
        return wisdom

    @staticmethod
    def update_wisdom(db: Session, wisdom_id: int, data: WisdomUpdate) -> Optional[Wisdom]:
        wisdom = db.query(Wisdom).filter(Wisdom.id == wisdom_id).first()
        if not wisdom:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None:
                setattr(wisdom, key, value)

        db.commit()
        db.refresh(wisdom)
        return wisdom

    @staticmethod
    def delete_wisdom(db: Session, wisdom_id: int) -> bool:
        wisdom = db.query(Wisdom).filter(Wisdom.id == wisdom_id).first()
        if not wisdom:
            return False
        db.delete(wisdom)
        db.commit()
        return True
