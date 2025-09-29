from pydantic import BaseModel, model_validator
from typing import List, Optional, Any
from datetime import date
from .cuenta import CuentaSimple
from .categoria import CategoriaSimple

class TransaccionBase(BaseModel):
    fecha: date
    valor: float
    tipo: str
    descripcion: Optional[str] = None

    # Añadimos el estado al esquema base para poder recibirlo desde el frontend
    estado: str = 'Confirmado' # Lo ponemos por defecto en 'Confirmado'

    cuenta_origen_id: Optional[int] = None
    cuenta_destino_id: Optional[int] = None
    categoria_id: Optional[int] = None

    # Usamos el nuevo decorador @model_validator
    @model_validator(mode='before')
    @classmethod
    def check_transaction_logic(cls, data: Any):
        # La lógica interna es la misma, solo cambia la firma de la función
        if isinstance(data, dict):
            tipo = data.get('tipo')
            estado = data.get('estado', 'Confirmado') # Leemos el estado
            origen = data.get('cuenta_origen_id')
            destino = data.get('cuenta_destino_id')
            categoria = data.get('categoria_id')

            # --- LÓGICA ACTUALIZADA ---
            # Las validaciones de cuentas y categorías ahora solo se aplican
            # si el estado de la transacción es 'Confirmado'.
            if estado == 'Confirmado':
                if tipo == "Gasto" and (not origen or not categoria):
                    raise ValueError("Los gastos confirmados deben tener cuenta de origen y categoría.")
                if tipo == "Ingreso" and (not destino or not categoria):
                    raise ValueError("Los ingresos confirmados deben tener cuenta de destino y categoría.")
                if tipo == "Transferencia" and (not origen or not destino):
                    raise ValueError("Las transferencias confirmadas deben tener cuenta de origen y destino.")


            # --- VALIDACIONES GENERALES (aplican a todos los estados) ---
            if tipo == "Gasto" and destino:
                raise ValueError("Los gastos no deben tener una cuenta de destino.")
            if tipo == "Ingreso" and origen:
                raise ValueError("Los ingresos no deben tener una cuenta de origen.")
            if tipo == "Transferencia" and categoria:
                raise ValueError("Las transferencias no deben tener una categoría.")
            if tipo not in ["Ingreso", "Gasto", "Transferencia"]:
                raise ValueError("El tipo debe ser 'Ingreso', 'Gasto' o 'Transferencia'.")

        return data

class TransaccionCreate(TransaccionBase):
    pass

class TransaccionResponse(TransaccionBase):
    id: int
    usuario_id: int # Añadimos el usuario_id para que se vea en la respuesta

    cuenta_origen: Optional[CuentaSimple] = None
    cuenta_destino: Optional[CuentaSimple] = None
    categoria: Optional[CategoriaSimple] = None

    class Config:
        from_attributes = True # Reemplaza a orm_mode en Pydantic V2

class TransaccionUpdate(TransaccionBase):
    # Hacemos todos los campos opcionales para la actualización
    fecha: Optional[date] = None
    valor: Optional[float] = None
    tipo: Optional[str] = None
    estado: Optional[str] = None

class TransaccionPeriodResponse(BaseModel):
    saldo_inicial_periodo: float
    transacciones: List[TransaccionResponse]
