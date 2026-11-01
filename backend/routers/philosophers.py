from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas import PhilosopherResponse, PhilosopherDetailResponse, WisdomRandomResponse, WisdomResponse
from services.wisdom_service import WisdomService

router = APIRouter(prefix="/api/philosophers", tags=["philosophers"])

@router.get("", response_model=List[PhilosopherResponse])
def get_philosophers(db: Session = Depends(get_db)):
    """Retrieve all available philosophers with their world positions and metadata."""
    return WisdomService.get_all_philosophers(db)

@router.get("/{philosopher_id}", response_model=PhilosopherDetailResponse)
def get_philosopher(philosopher_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed information and wisdom collection for a specific philosopher."""
    philosopher = WisdomService.get_philosopher_by_id(db, philosopher_id)
    if not philosopher:
        raise HTTPException(status_code=404, detail=f"Philosopher with id {philosopher_id} not found")
    return philosopher

@router.get("/{philosopher_id}/wisdom", response_model=WisdomRandomResponse)
def get_random_wisdom(
    philosopher_id: int,
    exclude_id: Optional[int] = Query(None, description="Previous wisdom ID to avoid immediate repetition"),
    db: Session = Depends(get_db)
):
    """Retrieve a randomly chosen wisdom entry for the specified philosopher from SQLite."""
    wisdom = WisdomService.get_random_wisdom(db, philosopher_id, exclude_id)
    if not wisdom:
        # Check if philosopher exists
        philosopher = WisdomService.get_philosopher_by_id(db, philosopher_id)
        if not philosopher:
            raise HTTPException(status_code=404, detail=f"Philosopher with id {philosopher_id} not found")
        raise HTTPException(status_code=404, detail=f"No wisdom entries found for philosopher {philosopher_id}")
    return wisdom

@router.get("/{philosopher_id}/wisdom/all", response_model=List[WisdomResponse])
def get_all_wisdom_for_philosopher(philosopher_id: int, db: Session = Depends(get_db)):
    """Retrieve all wisdom quotes and commentary for a specific philosopher."""
    philosopher = WisdomService.get_philosopher_by_id(db, philosopher_id)
    if not philosopher:
        raise HTTPException(status_code=404, detail=f"Philosopher with id {philosopher_id} not found")
    return WisdomService.get_all_wisdom_for_philosopher(db, philosopher_id)
