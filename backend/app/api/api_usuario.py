from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.schemas.usuario import UserCreate, UserRead
import app.crud.crud_usuario as crud

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.post("/", response_model=UserRead)
async def crear_usuario(usuario: UserCreate, db: AsyncSession = Depends(get_async_session)):
    db_usuario = await crud.get_usuario_by_email(db, usuario.email)
    if db_usuario:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return await crud.create_usuario(db, usuario)

@router.get("/{usuario_id}", response_model=UserRead)
async def obtener_usuario(usuario_id: int, db: AsyncSession = Depends(get_async_session)):
    usuario = await crud.get_usuario(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.get("/", response_model=list[UserRead])
async def listar_usuarios(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_session)):
    return await crud.get_usuarios(db, skip=skip, limit=limit)

@router.delete("/{usuario_id}", status_code=204)
async def eliminar_usuario(usuario_id: int, db: AsyncSession = Depends(get_async_session)):
    await crud.delete_usuario(db, usuario_id)
    return
