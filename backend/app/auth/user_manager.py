import os
from fastapi_users import BaseUserManager, IntegerIDMixin
from app.models.usuario import Usuario
from app.db.session import get_user_db
from fastapi import Depends

class UserManager(IntegerIDMixin, BaseUserManager[Usuario, int]):
    reset_password_token_secret = os.environ["JWT_SECRET"]
    verification_token_secret = os.environ["JWT_SECRET"]

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
