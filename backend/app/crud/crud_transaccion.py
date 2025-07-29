from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.transaccion import Transaccion
from app.schemas.transaccion import TransaccionCreate
from typing import List, Optional

async def get_transaccion(db: AsyncSession, transaccion_id: int, usuario_id: int) -> Optional[Transaccion]:
    result = await db.execute(
        select(Transaccion).where(
            Transaccion.id == transaccion_id,
            Transaccion.usuario_id == usuario_id
        )
    )
    return result.scalar_one_or_none()

async def get_transacciones_by_usuario(db: AsyncSession, usuario_id: int, skip=0, limit=100):
    result = await db.execute(
        select(Transaccion).where(Transaccion.usuario_id == usuario_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def get_transacciones_by_cuenta(db: AsyncSession, cuenta_id: int, skip: int = 0, limit: int = 100) -> List[Transaccion]:
    result = await db.execute(
        select(Transaccion).where(Transaccion.cuenta_id == cuenta_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create_transaccion(db: AsyncSession, transaccion: TransaccionCreate, usuario_id: int) -> Transaccion:
    data = transaccion.model_dump()
    data["usuario_id"] = usuario_id
    db_transaccion = Transaccion(**data)
    db.add(db_transaccion)
    await db.commit()
    await db.refresh(db_transaccion)
    return db_transaccion

async def delete_transaccion(db: AsyncSession, transaccion_id: int, usuario_id: int):
    result = await db.execute(
        select(Transaccion).where(
            Transaccion.id == transaccion_id,
            Transaccion.usuario_id == usuario_id
        )
    )
    transaccion = result.scalar_one_or_none()
    if transaccion:
        await db.delete(transaccion)
        await db.commit()
