import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
from sqlalchemy import text
from seed.seed_data import seed_database
from routers import philosophers, wisdom, admin
from schemas import HealthResponse
from services.wisdom_service import WisdomService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed initial data
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE philosophers ADD COLUMN face_image TEXT"))
            conn.commit()
        except Exception:
            pass
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown logic (if any)

app = FastAPI(
    title="Philosophy World API",
    description="Backend API delivering ancient philosophical wisdom and character metadata for Philosophy World 2D",
    version="1.0.0",
    lifespan=lifespan
)

# Allow CORS for React frontend (Vite default is 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular routers
app.include_router(philosophers.router)
app.include_router(wisdom.router)
app.include_router(admin.router)

@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health_check():
    """Verify backend health, database connection, and seed status."""
    db = SessionLocal()
    try:
        p_count, w_count = WisdomService.get_stats(db)
        return HealthResponse(
            status="healthy",
            version="1.0.0",
            database="connected",
            philosophers_count=p_count,
            wisdom_count=w_count
        )
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Welcome to the Philosophy World API",
        "docs": "/docs",
        "version": "1.0.0"
    }
