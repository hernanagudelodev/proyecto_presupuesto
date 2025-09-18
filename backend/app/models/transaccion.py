from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base


# --- CAMBIOS IMPORTANTES PARA INCLUIR TRANSFERENCIAS ENTRE CUENTAS ---
# Ahora una transacción puede tener una cuenta de origen y una de destino.

class Transaccion(Base):
    __tablename__ = "transacciones"
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    valor = Column(Float, nullable=False)
    tipo = Column(String, nullable=False)  # "Ingreso", "Gasto" o "Transferencia"
    descripcion = Column(String, nullable=True)

    # Por defecto, una transacción creada manualmente será 'Confirmado'.
    # Las que generemos a partir de las reglas serán 'Planeado'.
    estado = Column(String, nullable=False, default='Confirmado', index=True)

    # Este campo será NULL para transacciones manuales.
    regla_recurrente_id = Column(Integer, ForeignKey("reglas_recurrentes.id"), nullable=True)
    
    # La categoría es opcional (las transferencias no la necesitan)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)

    # --- CAMBIOS IMPORTANTES PARA INCLUIR TRANSFERENCIAS ENTRE CUENTAS ---
    # Renombramos 'cuenta_id' a 'cuenta_origen_id' para más claridad
    # y la hacemos opcional (un ingreso puro no tiene origen)
    cuenta_origen_id = Column(Integer, ForeignKey("cuentas.id"), nullable=True)

    # --- cuenta_destino_id para las transferencias ---
    cuenta_destino_id = Column(Integer, ForeignKey("cuentas.id"), nullable=True)

    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relaciones para acceder a los objetos completos
    categoria = relationship("Categoria")
    cuenta_origen = relationship("Cuenta", foreign_keys=[cuenta_origen_id])
    cuenta_destino = relationship("Cuenta", foreign_keys=[cuenta_destino_id])
    usuario = relationship("User", back_populates="transacciones")
    # Permite que desde una transacción podamos saber qué regla la generó.
    regla_recurrente = relationship("ReglaRecurrente")
