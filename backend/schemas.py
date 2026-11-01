from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class WisdomBase(BaseModel):
    quote: str
    explanation: str
    source: Optional[str] = None

class WisdomResponse(WisdomBase):
    id: int
    philosopher_id: int

    model_config = ConfigDict(from_attributes=True)

class WisdomRandomResponse(BaseModel):
    id: int
    philosopher_id: int
    philosopher_name: str
    quote: str
    explanation: str
    source: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PhilosopherBase(BaseModel):
    name: str
    description: str
    school: str
    image: str
    face_image: Optional[str] = None
    position_x: int
    position_y: int
    years: Optional[str] = None

class PhilosopherResponse(PhilosopherBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class PhilosopherDetailResponse(PhilosopherResponse):
    wisdom_entries: List[WisdomResponse] = []

    model_config = ConfigDict(from_attributes=True)

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    philosophers_count: int
    wisdom_count: int

# --- Admin Schemas ---
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    email: str
    message: str

class PhilosopherCreate(BaseModel):
    name: str
    description: str
    school: str
    image: str = "socrates.png"
    face_image: Optional[str] = None
    position_x: int = 500
    position_y: int = 500
    years: Optional[str] = "Contemporary Era"

class PhilosopherUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    school: Optional[str] = None
    image: Optional[str] = None
    face_image: Optional[str] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    years: Optional[str] = None

class WisdomCreate(BaseModel):
    quote: str
    explanation: str
    source: Optional[str] = None

class WisdomUpdate(BaseModel):
    quote: Optional[str] = None
    explanation: Optional[str] = None
    source: Optional[str] = None

class FaceUploadRequest(BaseModel):
    image_data: str
