# backend/app/schemas/regla_recurrente.py
from pydantic import BaseModel
from typing import Optional

# Campos base que se usarán en todos los esquemas
class ReglaRecurrenteBase(BaseModel):
    descripcion: str
    valor_predeterminado: float
    tipo: str
    frecuencia: str
    dia: Optional[int] = None
    mes: Optional[int] = None # <-- AÑADIDO
    categoria_predeterminada_id: Optional[int] = None

# Esquema para la creación de una nueva regla
class ReglaRecurrenteCreate(ReglaRecurrenteBase):
    pass

# Al actualizar, todos los campos son opcionales. El usuario solo enviará los que quiera cambiar.
class ReglaRecurrenteUpdate(BaseModel):
    descripcion: Optional[str] = None
    valor_predeterminado: Optional[float] = None
    tipo: Optional[str] = None
    frecuencia: Optional[str] = None
    dia: Optional[int] = None
    mes: Optional[int] = None # <-- AÑADIDO
    categoria_predeterminada_id: Optional[int] = None

# Esquema para la respuesta de la API (lo que se envía al frontend)
class ReglaRecurrenteResponse(ReglaRecurrenteBase):
    id: int
    usuario_id: int

    class Config:
        from_attributes = True