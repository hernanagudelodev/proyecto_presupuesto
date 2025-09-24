# backend/app/crud/crud_user.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.models.usuario import User
from app.schemas.usuario import AdminUserUpdate # Usaremos un schema especial para el admin


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Obtiene una lista de todos los usuarios, ordenados por ID.
    """
    result = await db.execute(
        select(User).order_by(User.id).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """
    Obtiene un usuario específico por su ID.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def update_user_by_admin(db: AsyncSession, *, db_obj: User, obj_in: AdminUserUpdate) -> User:
    """
    Actualiza un usuario desde el panel de administración.
    Permite cambiar nombre, estado de actividad, verificación y si es superusuario.
    """
    # Convierte el schema de Pydantic a un diccionario, excluyendo los campos no enviados
    update_data = obj_in.model_dump(exclude_unset=True)
    
    # Itera sobre los datos recibidos y actualiza el objeto de la base de datos
    for field, value in update_data.items():
        setattr(db_obj, field, value)

    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj