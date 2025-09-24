from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_async_session
from app.models.usuario import User
from app.auth import fastapi_users
from app.schemas.usuario import UserRead, AdminUserUpdate # Importamos los schemas correctos
import app.crud.crud_user as crud # Importamos nuestro nuevo archivo crud

# Creamos un router específico para estas operaciones de administración
router = APIRouter(
    prefix="/admin/users", # Usamos un prefijo claro para rutas de admin
    tags=["Admin - Users"], # Agrupamos estos endpoints en la documentación de la API
    # Así protegemos TODAS las rutas de este router para que solo superusuarios puedan acceder
    dependencies=[Depends(fastapi_users.current_user(active=True, superuser=True))]
)

@router.get("/", response_model=List[UserRead])
async def get_all_users(
    db: AsyncSession = Depends(get_async_session)
):
    """
    Obtiene una lista de todos los usuarios.
    Requiere autenticación como superusuario.
    """
    return await crud.get_users(db)


@router.patch("/{user_id}", response_model=UserRead)
async def update_user_by_admin(
    user_id: int,
    user_in: AdminUserUpdate,
    db: AsyncSession = Depends(get_async_session)
):
    """
    Actualiza los datos de un usuario específico.
    Permite a un admin modificar el nombre y los estados (activo, verificado, superusuario).
    """
    db_user = await crud.get_user_by_id(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return await crud.update_user_by_admin(db=db, db_obj=db_user, obj_in=user_in)