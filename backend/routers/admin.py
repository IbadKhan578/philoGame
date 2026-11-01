import os
import io
import time
import base64
from typing import List, Optional
from PIL import Image, ImageDraw
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Philosopher
from schemas import (
    LoginRequest,
    LoginResponse,
    PhilosopherResponse,
    PhilosopherDetailResponse,
    PhilosopherCreate,
    PhilosopherUpdate,
    WisdomResponse,
    WisdomCreate,
    WisdomUpdate,
    FaceUploadRequest
)
from services.wisdom_service import WisdomService

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Hardcoded Admin Credentials
ADMIN_EMAIL = "admin@philosophy.world"
ADMIN_ALIAS = "admin"
ADMIN_PASSWORD = "admin123"
ADMIN_TOKEN = "archivist_secret_token_2026"

@router.post("/login", response_model=LoginResponse)
def admin_login(creds: LoginRequest):
    """Authenticate administrator with hardcoded credentials."""
    email_clean = creds.email.strip().lower()
    pass_clean = creds.password.strip()

    if (email_clean == ADMIN_EMAIL or email_clean == ADMIN_ALIAS) and pass_clean == ADMIN_PASSWORD:
        return LoginResponse(
            success=True,
            token=ADMIN_TOKEN,
            email=ADMIN_EMAIL,
            message="Welcome to the Philosophy World Administrative Council."
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid administrative credentials. Access denied."
    )

# --- Philosopher Management ---

@router.post("/philosophers", response_model=PhilosopherResponse, status_code=status.HTTP_201_CREATED)
def create_philosopher(data: PhilosopherCreate, db: Session = Depends(get_db)):
    """Create a new philosopher."""
    return WisdomService.create_philosopher(db, data)

@router.put("/philosophers/{philosopher_id}", response_model=PhilosopherResponse)
def update_philosopher(philosopher_id: int, data: PhilosopherUpdate, db: Session = Depends(get_db)):
    """Update an existing philosopher."""
    updated = WisdomService.update_philosopher(db, philosopher_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Philosopher with id {philosopher_id} not found")
    return updated

@router.delete("/philosophers/{philosopher_id}")
def delete_philosopher(philosopher_id: int, db: Session = Depends(get_db)):
    """Delete a philosopher and cascade remove their wisdom entries."""
    success = WisdomService.delete_philosopher(db, philosopher_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Philosopher with id {philosopher_id} not found")
    return {"success": True, "message": f"Philosopher {philosopher_id} deleted successfully"}

def process_face_image(image_bytes: bytes) -> bytes:
    """Center-crop the face photo into a clean circle with transparent background."""
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = img.convert("RGBA")
        w, h = img.size
        min_dim = min(w, h)
        left = (w - min_dim) // 2
        top = (h - min_dim) // 2
        img = img.crop((left, top, left + min_dim, top + min_dim))
        img = img.resize((240, 240), Image.Resampling.LANCZOS)

        # Circular mask
        mask = Image.new("L", (240, 240), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, 240, 240), fill=255)

        output = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
        output.paste(img, (0, 0), mask=mask)

        buf = io.BytesIO()
        output.save(buf, format="PNG")
        return buf.getvalue()

@router.post("/philosophers/{philosopher_id}/face", response_model=PhilosopherResponse)
def upload_philosopher_face(
    philosopher_id: int,
    payload: FaceUploadRequest,
    db: Session = Depends(get_db)
):
    """Upload and set a custom face image for a philosopher."""
    philosopher = db.query(Philosopher).filter(Philosopher.id == philosopher_id).first()
    if not philosopher:
        raise HTTPException(status_code=404, detail=f"Philosopher with id {philosopher_id} not found")

    try:
        data_str = payload.image_data.strip()
        if "," in data_str:
            data_str = data_str.split(",", 1)[1]
        raw_bytes = base64.b64decode(data_str)

        # Process with Pillow to ensure circle crop
        processed_bytes = process_face_image(raw_bytes)

        # Target directory: frontend/public/assets/custom_faces
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "assets", "custom_faces"))
        os.makedirs(base_dir, exist_ok=True)

        filename = f"face_{philosopher_id}_{int(time.time())}.png"
        filepath = os.path.join(base_dir, filename)

        with open(filepath, "wb") as f:
            f.write(processed_bytes)

        # Remove old custom face file if it exists
        if philosopher.face_image and "/assets/custom_faces/" in philosopher.face_image:
            old_name = philosopher.face_image.split("/")[-1]
            old_path = os.path.join(base_dir, old_name)
            if os.path.exists(old_path) and old_path != filepath:
                try:
                    os.remove(old_path)
                except Exception:
                    pass

        philosopher.face_image = f"/assets/custom_faces/{filename}"
        db.commit()
        db.refresh(philosopher)
        return philosopher
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process face image: {str(e)}")

@router.delete("/philosophers/{philosopher_id}/face", response_model=PhilosopherResponse)
def reset_philosopher_face(philosopher_id: int, db: Session = Depends(get_db)):
    """Reset a philosopher's face back to the default classical portrait."""
    philosopher = db.query(Philosopher).filter(Philosopher.id == philosopher_id).first()
    if not philosopher:
        raise HTTPException(status_code=404, detail=f"Philosopher with id {philosopher_id} not found")

    if philosopher.face_image and "/assets/custom_faces/" in philosopher.face_image:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "assets", "custom_faces"))
        old_name = philosopher.face_image.split("/")[-1]
        old_path = os.path.join(base_dir, old_name)
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception:
                pass

    philosopher.face_image = None
    db.commit()
    db.refresh(philosopher)
    return philosopher

# --- Wisdom Management ---

@router.post("/philosophers/{philosopher_id}/wisdom", response_model=WisdomResponse, status_code=status.HTTP_201_CREATED)
def add_wisdom_entry(philosopher_id: int, data: WisdomCreate, db: Session = Depends(get_db)):
    """Add a new wisdom entry for a philosopher."""
    wisdom = WisdomService.create_wisdom(db, philosopher_id, data)
    if not wisdom:
        raise HTTPException(status_code=404, detail=f"Philosopher with id {philosopher_id} not found")
    return wisdom

@router.put("/wisdom/{wisdom_id}", response_model=WisdomResponse)
def update_wisdom_entry(wisdom_id: int, data: WisdomUpdate, db: Session = Depends(get_db)):
    """Update an existing wisdom entry."""
    updated = WisdomService.update_wisdom(db, wisdom_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Wisdom entry with id {wisdom_id} not found")
    return updated

@router.delete("/wisdom/{wisdom_id}")
def delete_wisdom_entry(wisdom_id: int, db: Session = Depends(get_db)):
    """Delete a wisdom entry."""
    success = WisdomService.delete_wisdom(db, wisdom_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Wisdom entry with id {wisdom_id} not found")
    return {"success": True, "message": f"Wisdom entry {wisdom_id} deleted successfully"}
