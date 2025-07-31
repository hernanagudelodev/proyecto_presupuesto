import os
from fastapi_users.manager import BaseUserManager, IntegerIDMixin
from app.models.usuario import User
from app.db.user_db import get_user_db
from fastapi import Depends, Request
from app.auth.email import fm, env
from fastapi_mail import MessageSchema

API_URL = os.getenv("API_URL", "http://localhost:8000")

class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = os.environ["JWT_SECRET"]
    verification_token_secret = os.environ["JWT_SECRET"]

    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ):
        link = f"{API_URL}/auth/verify?token={token}"
        html = env.get_template("verify.html").render(user=user, link=link)
        await fm.send_message(
            subject="Activa tu cuenta",
            recipients=[user.email],
            body=html,
            subtype="html",
        )

    async def on_after_forgot_password(self, user: User, token: str, request: Request | None = None):
        link = f"{API_URL}/auth/reset-password?token={token}"
        html = env.get_template("reset.html").render(user=user, link=link)
        message = MessageSchema(
            subject="Recupera tu contraseña",
            recipients=[user.email],
            body=html,
            subtype="html",
        )
        try:
            await fm.send_message(message)
        except Exception as e:
            # Loguea el fallo pero no abortes la ruta
            print(f"Error enviando email de reseteo: {e}")

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
