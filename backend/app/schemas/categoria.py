from typing import Optional
from pydantic import BaseModel

class CategoriaBase(BaseModel):
    nombre: str
    tipo: str  # "Ingreso" o "Gasto"

class CategoriaCreate(CategoriaBase):
    pass

# NUEVO: Esquema para la actualización
class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo: Optional[str] = None

class CategoriaResponse(CategoriaBase):
    id: int

    class Config:
        orm_mode = True
