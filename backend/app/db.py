from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.settings import settings

# Vercel runs FastAPI as serverless functions. A persistent SQLAlchemy pool can
# exhaust Supabase's connection/session limit across concurrent invocations.
# NullPool opens one connection per request and closes it when the session ends.
engine = create_engine(
    settings.sqlalchemy_database_url,
    poolclass=NullPool,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
