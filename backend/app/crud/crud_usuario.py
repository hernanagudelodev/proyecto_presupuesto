from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.usuario import User
from app.schemas.usuario import UserCreate
from typing import List, Optional
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_usuario(db: AsyncSession, usuario_id: int) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == usuario_id))
    return result.scalar_one_or_none()

async def get_usuario_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def get_usuarios(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[User]:
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()

async def create_usuario(db: AsyncSession, usuario: UserCreate) -> User:
    hashed_password = get_password_hash(usuario.password)
    db_usuario = User(nombre=usuario.nombre, email=usuario.email, hashed_password=hashed_password)
    db.add(db_usuario)
    await db.commit()
    await db.refresh(db_usuario)
    return db_usuario

async def delete_usuario(db: AsyncSession, usuario_id: int):
    result = await db.execute(select(User).where(User.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if usuario:
        await db.delete(usuario)
        await db.commit()
