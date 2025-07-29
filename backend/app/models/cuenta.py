from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from app.db.base_class import Base

class Cuenta(Base):
    __tablename__ = "cuentas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tipo = Column(String, nullable=False)  # Ej: "Efectivo", "Banco", "Tarjeta"
    saldo_inicial = Column(Float, nullable=False, default=0.0)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relación para acceder al usuario dueño de la cuenta
    usuario = relationship("User", back_populates="cuentas")
