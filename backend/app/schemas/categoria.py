from pydantic import BaseModel

class CategoriaBase(BaseModel):
    nombre: str
    tipo: str  # "Ingreso" o "Gasto"

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    id: int

    class Config:
        orm_mode = True
