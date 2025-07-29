import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Cargar las variables de entorno desde .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
# Asegúrate que la url es tipo 'sqlite+aiosqlite:///ruta' o 'postgresql+asyncpg://...'

engine = create_async_engine(
    DATABASE_URL, echo=True  # Puedes quitar echo=True en producción
)
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_async_session():
    async with async_session() as session:
        yield session
