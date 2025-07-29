from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.schemas.categoria import CategoriaCreate, CategoriaResponse
from app.models.usuario import User
from app.auth import current_active_user
import app.crud.crud_categoria as crud

router = APIRouter(prefix="/categorias", tags=["categorias"])

@router.post("/", response_model=CategoriaResponse)
async def crear_categoria(
    categoria: CategoriaCreate,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    return await crud.create_categoria(db, categoria, user.id)

@router.get("/", response_model=list[CategoriaResponse])
async def listar_categorias(
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    return await crud.get_categorias_by_usuario(db, user.id)

@router.get("/{categoria_id}", response_model=CategoriaResponse)
async def obtener_categoria(
    categoria_id: int,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    categoria = await crud.get_categoria(db, categoria_id, user.id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria

@router.delete("/{categoria_id}", status_code=204)
async def eliminar_categoria(
    categoria_id: int,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    categoria = await crud.get_categoria(db, categoria_id, user.id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    await crud.delete_categoria(db, categoria_id, user.id)
