from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.schemas.cuenta import CuentaCreate, CuentaResponse, CuentaUpdate
from app.models.usuario import User
from app.auth import current_active_user
import app.crud.crud_cuenta as crud

router = APIRouter(prefix="/cuentas", tags=["cuentas"])

@router.post("/", response_model=CuentaResponse)
async def crear_cuenta(
    cuenta: CuentaCreate,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    return await crud.create_cuenta(db, cuenta, user.id)

@router.get("/", response_model=list[CuentaResponse])
async def listar_cuentas(
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    return await crud.get_cuentas_by_usuario(db, user.id)

@router.get("/{cuenta_id}", response_model=CuentaResponse)
async def obtener_cuenta(
    cuenta_id: int,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    cuenta = await crud.get_cuenta(db, cuenta_id, user.id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return cuenta

# NUEVO: Endpoint para actualizar una cuenta
@router.put("/{cuenta_id}", response_model=CuentaResponse)
async def actualizar_cuenta(
    cuenta_id: int,
    cuenta_in: CuentaUpdate,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    db_cuenta = await crud.get_cuenta(db, cuenta_id=cuenta_id, usuario_id=user.id)
    if not db_cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return await crud.update_cuenta(db=db, db_obj=db_cuenta, obj_in=cuenta_in)

@router.delete("/{cuenta_id}", status_code=204)
async def eliminar_cuenta(
    cuenta_id: int,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    cuenta = await crud.get_cuenta(db, cuenta_id, user.id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    await crud.delete_cuenta(db, cuenta_id, user.id)
