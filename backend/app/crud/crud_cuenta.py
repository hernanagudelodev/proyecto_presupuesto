from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.cuenta import Cuenta
from app.schemas.cuenta import CuentaCreate
from typing import List, Optional

async def create_cuenta(db: AsyncSession, cuenta: CuentaCreate, usuario_id: int) -> Cuenta:
    data = cuenta.model_dump()
    data["usuario_id"] = usuario_id
    db_cuenta = Cuenta(**data)
    db.add(db_cuenta)
    await db.commit()
    await db.refresh(db_cuenta)
    return db_cuenta

async def get_cuenta(db: AsyncSession, cuenta_id: int, usuario_id: int) -> Optional[Cuenta]:
    result = await db.execute(
        select(Cuenta).where(
            Cuenta.id == cuenta_id,
            Cuenta.usuario_id == usuario_id
        )
    )
    return result.scalar_one_or_none()

async def get_cuentas_by_usuario(db: AsyncSession, usuario_id: int, skip: int = 0, limit: int = 100) -> List[Cuenta]:
    # El único cambio está aquí. La consulta es la misma,
    # pero SQLAlchemy es lo suficientemente inteligente como para saber que,
    # como 'saldo_actual' está en el esquema de respuesta, debe calcularlo.
    # La 'hybrid_property' hace todo el trabajo pesado por nosotros.
    result = await db.execute(
        select(Cuenta).where(Cuenta.usuario_id == usuario_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def delete_cuenta(db: AsyncSession, cuenta_id: int, usuario_id: int):
    result = await db.execute(
        select(Cuenta).where(
            Cuenta.id == cuenta_id,
            Cuenta.usuario_id == usuario_id
        )
    )
    cuenta = result.scalar_one_or_none()
    if cuenta:
        await db.delete(cuenta)
        await db.commit()