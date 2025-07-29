from pydantic import BaseModel
from typing import Optional

class CuentaBase(BaseModel):
    nombre: str
    tipo: str
    saldo_inicial: float

class CuentaCreate(CuentaBase):
    pass

class CuentaResponse(CuentaBase):
    id: int
    usuario_id: int

    class Config:
        orm_mode = True
