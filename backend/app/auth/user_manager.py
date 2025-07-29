import os
from fastapi_users.manager import BaseUserManager, IntegerIDMixin
from app.models.usuario import User
from app.db.user_db import get_user_db
from fastapi import Depends

class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = os.environ["JWT_SECRET"]
    verification_token_secret = os.environ["JWT_SECRET"]


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
