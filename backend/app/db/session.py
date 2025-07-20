import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Cargar las variables de entorno desde .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}  # Necesario para SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
