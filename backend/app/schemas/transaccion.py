from pydantic import BaseModel, model_validator
from typing import Optional, Any
from datetime import date

class TransaccionBase(BaseModel):
    fecha: date
    valor: float
    tipo: str
    descripcion: Optional[str] = None

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
            origen = data.get('cuenta_origen_id')
            destino = data.get('cuenta_destino_id')
            categoria = data.get('categoria_id')

            if tipo == "Gasto":
                if not origen or not categoria:
                    raise ValueError("Los gastos deben tener una cuenta de origen y una categoría.")
                if destino:
                    raise ValueError("Los gastos no deben tener una cuenta de destino.")

            elif tipo == "Ingreso":
                if not destino or not categoria:
                    raise ValueError("Los ingresos deben tener una cuenta de destino y una categoría.")
                if origen:
                    raise ValueError("Los ingresos no deben tener una cuenta de origen.")

            elif tipo == "Transferencia":
                if not origen or not destino:
                    raise ValueError("Las transferencias deben tener una cuenta de origen y una de destino.")
                if categoria:
                    raise ValueError("Las transferencias no deben tener una categoría.")

            else:
                raise ValueError("El tipo de transacción debe ser 'Ingreso', 'Gasto' o 'Transferencia'.")

        return data

class TransaccionCreate(TransaccionBase):
    pass

class TransaccionResponse(TransaccionBase):
    id: int
    usuario_id: int # Añadimos el usuario_id para que se vea en la respuesta

    class Config:
        from_attributes = True # Reemplaza a orm_mode en Pydantic V2