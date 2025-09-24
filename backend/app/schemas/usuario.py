from fastapi_users import schemas
from pydantic import BaseModel
from typing import Optional
from datetime import datetime # Importamos datetime

class UserRead(schemas.BaseUser[int]):
    nombre: str
    # Añadimos la fecha de creación para poder mostrarla en el panel
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreate(schemas.BaseUserCreate):
    nombre: str


class UserUpdate(schemas.BaseUserUpdate):
    nombre: Optional[str] = None


# --- NUEVO SCHEMA PARA EL ADMIN ---
# Define los campos que el administrador podrá modificar de otros usuarios.
class AdminUserUpdate(BaseModel):
    nombre: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_superuser: Optional[bool] = None