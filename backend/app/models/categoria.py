from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tipo = Column(String, nullable=False)  # "Ingreso" o "Gasto"

    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    usuario = relationship("User", back_populates="categorias")
