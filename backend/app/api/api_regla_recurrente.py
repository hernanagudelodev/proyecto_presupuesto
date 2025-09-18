from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_async_session
from app.models.usuario import User
from app.auth import current_active_user
import app.crud.crud_regla_recurrente as crud
from app.schemas.regla_recurrente import ReglaRecurrenteCreate, ReglaRecurrenteResponse, ReglaRecurrenteUpdate
from app.schemas.transaccion import TransaccionResponse

# Creamos un nuevo router
router = APIRouter(prefix="/reglas-recurrentes", tags=["reglas-recurrentes"])

# --- Endpoint para CREAR una nueva regla ---
@router.post("/", response_model=ReglaRecurrenteResponse, status_code=201)
async def crear_regla_recurrente(
    regla: ReglaRecurrenteCreate,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    return await crud.create_regla(db=db, regla=regla, usuario_id=user.id)

# --- Endpoint para LISTAR todas las reglas del usuario ---
@router.get("/", response_model=List[ReglaRecurrenteResponse])
async def listar_reglas_recurrentes(
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    skip: int = 0,
    limit: int = 100,
):
    return await crud.get_reglas_by_usuario(db=db, usuario_id=user.id, skip=skip, limit=limit)

# --- Endpoint para ACTUALIZAR una regla existente ---
@router.put("/{regla_id}", response_model=ReglaRecurrenteResponse)
async def actualizar_regla_recurrente(
    regla_id: int,
    regla_in: ReglaRecurrenteUpdate,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    # Primero, verificamos que la regla exista y pertenezca al usuario
    db_regla = await crud.get_regla(db=db, regla_id=regla_id, usuario_id=user.id)
    if not db_regla:
        raise HTTPException(status_code=404, detail="Regla no encontrada")
    # Si existe, la actualizamos
    return await crud.update_regla(db=db, db_obj=db_regla, obj_in=regla_in)

# --- Endpoint para ELIMINAR una regla ---
@router.delete("/{regla_id}", status_code=204)
async def eliminar_regla_recurrente(
    regla_id: int,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    regla_eliminada = await crud.delete_regla(db=db, regla_id=regla_id, usuario_id=user.id)
    if not regla_eliminada:
        raise HTTPException(status_code=404, detail="Regla no encontrada")
    # Si se elimina con éxito, no se devuelve contenido
    return

@router.post("/generar-transacciones/{year}/{month}", response_model=List[TransaccionResponse])
async def generar_transacciones_del_mes(
    year: int,
    month: int,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    if not 1 <= month <= 12:
        raise HTTPException(status_code=400, detail="El mes debe estar entre 1 y 12.")

    transacciones_generadas = await crud.generar_transacciones_planeadas(
        db=db, usuario_id=user.id, year=year, month=month
    )
    return transacciones_generadas