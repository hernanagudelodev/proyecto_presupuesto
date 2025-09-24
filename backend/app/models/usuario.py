from sqlalchemy import Column, Integer, String, Boolean, DateTime, func # <-- Añadir DateTime y func
from app.db.base_class import Base  # Usa tu instancia única de Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    nombre = Column(String, nullable=False)  # campo personalizado

    # Se registrará automáticamente la fecha y hora de creación
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    transacciones = relationship("Transaccion", back_populates="usuario")
    cuentas = relationship("Cuenta", back_populates="usuario")
    categorias = relationship("Categoria", back_populates="usuario")