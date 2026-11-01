from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Wisdom, Philosopher
from schemas import WisdomRandomResponse

router = APIRouter(prefix="/api/wisdom", tags=["wisdom"])

@router.get("/all")
def get_all_wisdom(db: Session = Depends(get_db)):
    """Retrieve all wisdom entries across all philosophers, joined with philosopher name."""
    results = (
        db.query(Wisdom, Philosopher.name.label("philosopher_name"))
        .join(Philosopher, Wisdom.philosopher_id == Philosopher.id)
        .all()
    )
    return [
        {
            "id": w.id,
            "philosopher_id": w.philosopher_id,
            "philosopher_name": name,
            "quote": w.quote,
            "explanation": w.explanation,
            "source": w.source
        }
        for w, name in results
    ]
