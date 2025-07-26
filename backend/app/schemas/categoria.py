from pydantic import BaseModel

class CategoriaBase(BaseModel):
    nombre: str
    tipo: str  # "Ingreso" o "Gasto"

class CategoriaCreate(CategoriaBase):
    usuario_id: int

class CategoriaResponse(CategoriaBase):
    id: int

    class Config:
        orm_mode = True
