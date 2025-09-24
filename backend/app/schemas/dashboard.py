from pydantic import BaseModel

class ResumenMensual(BaseModel):
    """
    Este schema representa los datos agregados para un solo mes.
    """
    mes: int
    total_ingresos: float
    total_gastos: float

    class Config:
        from_attributes = True

class ResumenPorCategoria(BaseModel):
    """
    Representa el total de gastos para una categoría específica.
    """
    nombre_categoria: str
    total_gastado: float

    class Config:
        from_attributes = True