"""
Database Models with SQLite fallback
"""
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

Base = declarative_base()

class CheckResult(Base):
    """Результат проверки на плагиат"""
    __tablename__ = "check_results"
    
    task_id = Column(String, primary_key=True, index=True)
    status = Column(String, default="pending")
    originality = Column(Float, nullable=True)
    total_words = Column(Integer, nullable=True)
    total_chars = Column(Integer, nullable=True)
    matches = Column(JSON, nullable=True)
    sources = Column(JSON, nullable=True)
    ai_powered = Column(String, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, nullable=True, index=True)

# Use SQLite for now (PostgreSQL connection issues)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./antiplagiat.db")

# Force SQLite if PostgreSQL URL is problematic
if "dpg-d48gfj3e5dus73c6qqp0-a" in DATABASE_URL:
    print("⚠️  Detected problematic PostgreSQL URL, using SQLite instead")
    DATABASE_URL = "sqlite:///./antiplagiat.db"

print(f"📊 Using database: {'SQLite' if 'sqlite' in DATABASE_URL else 'PostgreSQL'}")

try:
    if "sqlite" in DATABASE_URL:
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            echo=False
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            echo=False
        )
    print("✓ Database engine created successfully")
except Exception as e:
    print(f"❌ Database error: {e}")
    print("⚠️  Falling back to SQLite")
    DATABASE_URL = "sqlite:///./antiplagiat.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency для FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Инициализация БД"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")