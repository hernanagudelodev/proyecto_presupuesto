from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
# Se importa 'selectinload' para la carga ansiosa
from sqlalchemy.orm import selectinload 
from app.models.transaccion import Transaccion
from app.schemas.transaccion import TransaccionCreate, TransaccionUpdate
from typing import List, Optional

async def get_transaccion(db: AsyncSession, transaccion_id: int, usuario_id: int) -> Optional[Transaccion]:
    result = await db.execute(
        select(Transaccion).where(
            Transaccion.id == transaccion_id,
            Transaccion.usuario_id == usuario_id
        )
        .options(
            selectinload(Transaccion.cuenta_origen), 
            selectinload(Transaccion.cuenta_destino)
        )
    )
    return result.scalar_one_or_none()

async def get_transacciones_by_usuario(db: AsyncSession, usuario_id: int, skip=0, limit=100):
    # Se utiliza .options(selectinload(...)) para cargar las cuentas
    # relacionadas en la misma consulta y evitar el error de carga perezosa.
    query = (
        select(Transaccion)
        .where(Transaccion.usuario_id == usuario_id)
        .options(
            selectinload(Transaccion.cuenta_origen), 
            selectinload(Transaccion.cuenta_destino)
        )
        .order_by(Transaccion.fecha.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()

# La función de crear ahora también necesita cargar las relaciones antes de devolver.
async def create_transaccion(db: AsyncSession, transaccion: TransaccionCreate, usuario_id: int) -> Transaccion:
    db_transaccion = Transaccion(
        **transaccion.model_dump(),
        usuario_id=usuario_id
    )
    db.add(db_transaccion)
    await db.commit()
    await db.refresh(db_transaccion)

    # Después de crear, volvemos a consultar la transacción con sus
    # relaciones cargadas para evitar el error 'MissingGreenlet' en la respuesta.
    result = await db.execute(
        select(Transaccion)
        .where(Transaccion.id == db_transaccion.id)
        .options(
            selectinload(Transaccion.cuenta_origen),
            selectinload(Transaccion.cuenta_destino)
        )
    )
    return result.scalar_one()

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

# La función de actualizar
async def update_transaccion(db: AsyncSession, *, db_obj: Transaccion, obj_in: TransaccionUpdate) -> Transaccion:
    obj_data = obj_in.model_dump(exclude_unset=True)
    for field in obj_data:
        setattr(db_obj, field, obj_data[field])
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    # --- CORRECCIÓN CLAVE ---
    # También aplicamos la misma lógica de recarga aquí después de actualizar.
    # Esto asegura que la respuesta a la API siempre incluya las relaciones.
    result = await db.execute(
        select(Transaccion)
        .where(Transaccion.id == db_obj.id)
        .options(
            selectinload(Transaccion.cuenta_origen),
            selectinload(Transaccion.cuenta_destino)
        )
    )
    return result.scalar_one()