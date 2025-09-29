from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from app.db.session import get_async_session
from app.schemas.transaccion import TransaccionCreate, TransaccionResponse, TransaccionUpdate, TransaccionPeriodResponse
from app.models.usuario import User
from app.auth import current_active_user
import app.crud.crud_transaccion as crud

router = APIRouter(prefix="/transacciones", tags=["transacciones"])

# Crear una transacción
@router.post("/", response_model=TransaccionResponse)
async def crear_transaccion(
    transaccion: TransaccionCreate,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    return await crud.create_transaccion(db, transaccion, user.id)

# ---  ENDPOINT PARA TRANSACCIONES EN EL DASHBOARD --
@router.get("/latest/", response_model=List[TransaccionResponse])
async def listar_ultimas_transacciones(
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """
    Obtiene las últimas 10 transacciones confirmadas para el dashboard.
    """
    return await crud.get_latest_confirmed_transactions(db=db, usuario_id=user.id, limit=10)

# --- ENDPOINT PARA FILTRAR POR PERÍODO PARA EL HISTORIAL ---
@router.get("/", response_model=TransaccionPeriodResponse)
async def listar_transacciones_periodo(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """
    Obtiene todas las transacciones de un usuario dentro de un rango de fechas
    y calcula el saldo total justo antes de la fecha de inicio.
    """
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="La fecha de inicio no puede ser posterior a la fecha de fin.")
    
    # Llamamos la función del crud
    period_data = await crud.get_transactions_with_starting_balance(
        db=db,
        usuario_id=user.id,
        start_date=start_date,
        end_date=end_date
    )
    return period_data

# Obtener una transacción por ID
@router.get("/{transaccion_id}", response_model=TransaccionResponse)
async def obtener_transaccion(
    transaccion_id: int,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    transaccion = await crud.get_transaccion(db, transaccion_id, user.id)
    if not transaccion:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    return transaccion

# Eliminar una transacción
@router.delete("/{transaccion_id}", status_code=204)
async def eliminar_transaccion(
    transaccion_id: int,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    transaccion = await crud.get_transaccion(db, transaccion_id, user.id)
    if not transaccion:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    await crud.delete_transaccion(db, transaccion_id, user.id)


# Actualizar una transacción
@router.put("/{transaccion_id}", response_model=TransaccionResponse)
async def actualizar_transaccion(
    transaccion_id: int,
    transaccion: TransaccionUpdate,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    db_transaccion = await crud.get_transaccion(db, transaccion_id=transaccion_id, usuario_id=user.id)
    if not db_transaccion:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    return await crud.update_transaccion(db=db, db_obj=db_transaccion, obj_in=transaccion)
