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

    # --- NUEVO CAMPO ---
    # Añadimos el saldo actual, que será calculado por la propiedad híbrida
    saldo_actual: float

    class Config:
        # Usamos from_attributes (el nuevo orm_mode) para que Pydantic
        # pueda leer propiedades como 'saldo_actual' además de las columnas.
        from_attributes = True