from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
# Se importa 'selectinload' para la carga ansiosa
from sqlalchemy.orm import selectinload 
from sqlalchemy import func, case
from app.models.transaccion import Transaccion
from app.schemas.transaccion import TransaccionCreate, TransaccionUpdate
from app.models.cuenta import Cuenta
from typing import List, Optional, Dict, Any
from datetime import date, timedelta

async def get_transaccion(db: AsyncSession, transaccion_id: int, usuario_id: int) -> Optional[Transaccion]:
    result = await db.execute(
        select(Transaccion).where(
            Transaccion.id == transaccion_id,
            Transaccion.usuario_id == usuario_id
        )
        .options(
            selectinload(Transaccion.cuenta_origen), 
            selectinload(Transaccion.cuenta_destino),
            selectinload(Transaccion.categoria)
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
            selectinload(Transaccion.cuenta_destino),
            selectinload(Transaccion.categoria)
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
            selectinload(Transaccion.cuenta_destino),
            selectinload(Transaccion.categoria)
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
            selectinload(Transaccion.cuenta_destino),
            selectinload(Transaccion.categoria)
        )
    )
    return result.scalar_one()

async def get_transactions_with_starting_balance(
    db: AsyncSession, 
    usuario_id: int, 
    start_date: date, 
    end_date: date
) -> Dict[str, Any]:
    """
    Obtiene todas las transacciones dentro de un rango de fechas y calcula
    el saldo total del usuario justo antes de la fecha de inicio.
    """
    # 1. Calcular el saldo inicial del período
    # Fecha del día anterior a la fecha de inicio
    previous_day = start_date - timedelta(days=1)

    # Suma de saldos iniciales de todas las cuentas
    total_saldo_inicial_query = select(func.sum(Cuenta.saldo_inicial)).where(Cuenta.usuario_id == usuario_id)
    total_saldo_inicial_result = await db.execute(total_saldo_inicial_query)
    total_saldo_inicial = total_saldo_inicial_result.scalar_one_or_none() or 0.0

    # Suma de ingresos y resta de gastos hasta el día anterior
    balance_change_query = select(
        func.sum(
            case(
                (Transaccion.tipo == 'Ingreso', Transaccion.valor),
                (Transaccion.tipo == 'Gasto', -Transaccion.valor),
                else_=0
            )
        )
    ).where(
        Transaccion.usuario_id == usuario_id,
        Transaccion.estado == 'Confirmado',
        Transaccion.fecha <= previous_day
    )
    balance_change_result = await db.execute(balance_change_query)
    balance_change = balance_change_result.scalar_one_or_none() or 0.0

    starting_balance = total_saldo_inicial + balance_change

    # 2. Obtener las transacciones del período solicitado
    transactions_query = (
        select(Transaccion)
        .where(
            Transaccion.usuario_id == usuario_id,
            Transaccion.fecha.between(start_date, end_date)
        )
        .options(
            selectinload(Transaccion.cuenta_origen),
            selectinload(Transaccion.cuenta_destino),
            selectinload(Transaccion.categoria)
        )
        .order_by(Transaccion.fecha.desc(), Transaccion.id.desc())
    )
    transactions_result = await db.execute(transactions_query)
    transactions = transactions_result.scalars().all()

    # 3. Devolver el paquete completo de datos
    return {
        "saldo_inicial_periodo": starting_balance,
        "transacciones": transactions
    }

async def get_latest_confirmed_transactions(db: AsyncSession, usuario_id: int, limit: int = 10) -> List[Transaccion]:
    """
    Obtiene las últimas N transacciones confirmadas para el resumen del dashboard.
    """
    query = (
        select(Transaccion)
        .where(Transaccion.usuario_id == usuario_id, Transaccion.estado == 'Confirmado')
        .options(
            selectinload(Transaccion.cuenta_origen),
            selectinload(Transaccion.cuenta_destino),
            selectinload(Transaccion.categoria)
        )
        .order_by(Transaccion.fecha.desc(), Transaccion.id.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()