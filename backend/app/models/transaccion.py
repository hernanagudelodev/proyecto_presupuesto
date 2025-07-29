from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Transaccion(Base):
    __tablename__ = "transacciones"
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    valor = Column(Float, nullable=False)
    tipo = Column(String, nullable=False)  # "Ingreso" o "Gasto"
    descripcion = Column(String, nullable=True)
    cuenta_id = Column(Integer, ForeignKey("cuentas.id"), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    cuenta = relationship("Cuenta")
    categoria = relationship("Categoria")
    usuario = relationship("User", back_populates="transacciones")
