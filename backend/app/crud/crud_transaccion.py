from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.transaccion import Transaccion
from app.schemas.transaccion import TransaccionCreate, TransaccionUpdate
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
        select(Transaccion).where(Transaccion.usuario_id == usuario_id).order_by(Transaccion.fecha.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()

# La función de crear ahora solo se ocupa de crear la transacción. ¡Y ya está!
async def create_transaccion(db: AsyncSession, transaccion: TransaccionCreate, usuario_id: int) -> Transaccion:
    db_transaccion = Transaccion(
        **transaccion.model_dump(),
        usuario_id=usuario_id
    )
    db.add(db_transaccion)
    await db.commit()
    await db.refresh(db_transaccion)
    return db_transaccion

async def delete_transaccion(db: AsyncSession, transaccion_id: int, usuario_id: int):
    # NOTA: En el futuro, la eliminación de una transacción debería recalcular saldos
    # o manejar consistencia, pero por ahora esto es correcto.
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


# La función de actualizar
async def update_transaccion(db: AsyncSession, *, db_obj: Transaccion, obj_in: TransaccionUpdate) -> Transaccion:
    obj_data = obj_in.model_dump(exclude_unset=True)
    for field in obj_data:
        setattr(db_obj, field, obj_data[field])
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

