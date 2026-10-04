"""
SmartRoute-AI Database Configuration
====================================
Module: backend/app/database.py
Author: Antigravity AI Engineering Team

Configures SQLAlchemy engine, session, and declarative base.
Defaults to zero-configuration SQLite for effortless local demonstrations,
with instant configuration switch to PostgreSQL via DATABASE_URL environment variable.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Workspace paths
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(ROOT_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_SQLITE_PATH = os.path.join(DATA_DIR, "smartroute.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")

# SQLite requires check_same_thread=False for FastAPI concurrency
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for obtaining database sessions per HTTP request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
