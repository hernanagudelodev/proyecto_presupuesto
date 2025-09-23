from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate
from typing import List, Optional

async def get_categoria(db: AsyncSession, categoria_id: int, usuario_id: int) -> Optional[Categoria]:
    result = await db.execute(
        select(Categoria).where(
            Categoria.id == categoria_id,
            Categoria.usuario_id == usuario_id
        )
    )
    return result.scalar_one_or_none()

async def get_categorias_by_usuario(db: AsyncSession, usuario_id: int, skip=0, limit=100) -> List[Categoria]:
    result = await db.execute(
        select(Categoria).where(Categoria.usuario_id == usuario_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create_categoria(db: AsyncSession, categoria: CategoriaCreate, usuario_id: int) -> Categoria:
    data = categoria.model_dump()
    data["usuario_id"] = usuario_id
    db_categoria = Categoria(**data)
    db.add(db_categoria)
    await db.commit()
    await db.refresh(db_categoria)
    return db_categoria

# NUEVO: Función para actualizar una categoría
async def update_categoria(db: AsyncSession, *, db_obj: Categoria, obj_in: CategoriaUpdate) -> Categoria:
    obj_data = obj_in.model_dump(exclude_unset=True)
    for field in obj_data:
        setattr(db_obj, field, obj_data[field])
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete_categoria(db: AsyncSession, categoria_id: int, usuario_id: int):
    result = await db.execute(
        select(Categoria).where(
            Categoria.id == categoria_id,
            Categoria.usuario_id == usuario_id
        )
    )
    categoria = result.scalar_one_or_none()
    if categoria:
        await db.delete(categoria)
        await db.commit()
