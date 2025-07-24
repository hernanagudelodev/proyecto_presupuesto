from sqlalchemy import Column, Integer, String
from app.models.cuenta import Base

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tipo = Column(String, nullable=False)  # "Ingreso" o "Gasto"
