from sqlalchemy import Column, Integer, String, Float, ForeignKey, func, select
from sqlalchemy.orm import relationship, column_property
# from sqlalchemy.ext.hybrid import hybrid_property
from app.db.base_class import Base
from app.models.transaccion import Transaccion # <-- Importante importar Transaccion

class Cuenta(Base):
    __tablename__ = "cuentas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tipo = Column(String, nullable=False)
    saldo_inicial = Column(Float, nullable=False, default=0.0)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relación para acceder al usuario dueño de la cuenta
    usuario = relationship("User", back_populates="cuentas")

     # --- VERSIÓN CORREGIDA de la propiedad ---

    # saldo_actual se define como una propiedad que se calcula con esta "receta"
    saldo_actual = column_property(
        
        # La fórmula principal: empezamos con el saldo inicial de la cuenta...
        saldo_inicial +

        # ...luego, le sumamos todos los ingresos...
        func.coalesce(
            # Para calcular los ingresos, hacemos una mini-búsqueda (una subconsulta)
            select(func.sum(Transaccion.valor))  # 1. "Suma el valor de todas las transacciones..."
            .where(Transaccion.cuenta_destino_id == id, Transaccion.estado == 'Confirmado') # 2. "...pero SÓLO de aquellas donde esta cuenta ('id') es el destino."
            .correlate_except(Transaccion) # 3. (Técnico) "Esta mini-búsqueda está relacionada con la cuenta que estamos calculando ahora."
            .scalar_subquery(), # 4. "Convierte el resultado de la suma en un solo número."
            0 # 5. El '0' en coalesce: "Si la suma da 'nada' (null), usa 0 en su lugar."
        ) -

        # ...y finalmente, le restamos todos los egresos.
        func.coalesce(
            # La lógica es idéntica a la de los ingresos...
            select(func.sum(Transaccion.valor))
            .where(Transaccion.cuenta_origen_id == id, Transaccion.estado == 'Confirmado') # ...pero aquí buscamos las transacciones donde esta cuenta es el ORIGEN.
            .correlate_except(Transaccion)
            .scalar_subquery(),
            0 # De nuevo, si no hay egresos, usamos 0.
        )
    )


# --- RELACIONES INVERSAS EN EL MODELO TRANSACCION ---
# Necesitamos estas relaciones para que la propiedad híbrida funcione.
# Le decimos a SQLAlchemy que una Cuenta puede tener muchas transacciones de origen y destino.
transacciones_origen = relationship("Transaccion", foreign_keys=[Transaccion.cuenta_origen_id], back_populates="cuenta_origen")
transacciones_destino = relationship("Transaccion", foreign_keys=[Transaccion.cuenta_destino_id], back_populates="cuenta_destino")