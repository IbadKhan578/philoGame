import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ORIGINAL_DB = os.path.join(BASE_DIR, "philosophy_world.db")

# In Vercel serverless functions, the root filesystem is read-only.
# We copy the pre-seeded SQLite database to writable /tmp directory if running on Vercel.
if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    DATABASE_PATH = "/tmp/philosophy_world.db"
    if not os.path.exists(DATABASE_PATH) and os.path.exists(ORIGINAL_DB):
        shutil.copy2(ORIGINAL_DB, DATABASE_PATH)
else:
    DATABASE_PATH = ORIGINAL_DB

DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
