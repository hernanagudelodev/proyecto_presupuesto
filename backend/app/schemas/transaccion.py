from pydantic import BaseModel
from typing import Optional
from datetime import date

class TransaccionBase(BaseModel):
    fecha: date
    valor: float
    tipo: str            # "Ingreso" o "Gasto"
    descripcion: Optional[str] = None
    cuenta_id: int
    categoria_id: int

class TransaccionCreate(TransaccionBase):
    pass

class TransaccionResponse(TransaccionBase):
    id: int

    class Config:
        orm_mode = True
