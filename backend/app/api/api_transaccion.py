from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.schemas.transaccion import TransaccionCreate, TransaccionResponse
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

# Listar transacciones del usuario autenticado
@router.get("/", response_model=list[TransaccionResponse])
async def listar_transacciones_usuario(
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    return await crud.get_transacciones_by_usuario(db, user.id)

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
