from fastapi_users import FastAPIUsers
from app.auth.jwt import auth_backend
from app.auth.user_manager import get_user_manager
from app.auth.user_db import UserDB
from app.models.usuario import Usuario

fastapi_users = FastAPIUsers[UserDB, int](
    get_user_manager,
    [auth_backend],
)

# Dependencias reutilizables
current_active_user = fastapi_users.current_user(active=True)
