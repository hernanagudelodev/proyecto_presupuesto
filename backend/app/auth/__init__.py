from fastapi_users import FastAPIUsers
from app.models.usuario import User
from app.schemas.usuario import UserRead, UserCreate
from app.auth.user_manager import get_user_manager
from app.auth.jwt import auth_backend

fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)

current_active_user = fastapi_users.current_user(active=True)
