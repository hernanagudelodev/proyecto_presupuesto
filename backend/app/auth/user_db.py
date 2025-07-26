# app/auth/user_db.py
from fastapi_users.db import SQLAlchemyBaseUserTable
from app.models.usuario import Usuario

class UserDB(Usuario, SQLAlchemyBaseUserTable[int]):
    pass
