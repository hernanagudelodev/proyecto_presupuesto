from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy import Column, String

Base = declarative_base()

class Usuario(Base, SQLAlchemyBaseUserTable[int]):
    __tablename__ = "usuarios"
    nombre = Column(String, nullable=False)

engine = create_engine("sqlite:///test.db")
Base.metadata.create_all(engine)
