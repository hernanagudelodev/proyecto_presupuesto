from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_async_session
from app.models.usuario import User
from app.auth import current_active_user
import app.crud.crud_dashboard as crud
from app.schemas.dashboard import ResumenMensual, ResumenPorCategoria # <-- Importar el nuevo schema


router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/resumen-mensual/{year}", response_model=List[ResumenMensual])
async def obtener_resumen_mensual(
    year: int,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """
    Devuelve un resumen de ingresos y gastos totales para cada mes del año especificado.
    """
    return await crud.get_resumen_mensual_por_ano(db=db, usuario_id=user.id, year=year)


@router.get("/gastos-por-categoria/{year}/{month}", response_model=List[ResumenPorCategoria])
async def obtener_gastos_por_categoria(
    year: int,
    month: int,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """
    Devuelve un resumen de los gastos totales agrupados por categoría
    para un mes y año específicos.
    """
    return await crud.get_resumen_gastos_por_categoria(db=db, usuario_id=user.id, year=year, month=month)