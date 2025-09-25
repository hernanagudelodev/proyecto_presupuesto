# backend/app/auth/user_manager.py
import os
from fastapi import Depends, Request
from fastapi_users.manager import BaseUserManager, IntegerIDMixin

from app.models.usuario import User
from app.db.user_db import get_user_db
from app.services.email_service import email_service # Usamos nuestro nuevo servicio

class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = os.environ["JWT_SECRET"]
    verification_token_secret = os.environ["JWT_SECRET"]

    async def on_after_register(self, user: User, request: Request | None = None):
        print(f"✅ Usuario '{user.email}' registrado. Solicitando token...")
        try:
            # Paso 1: Llamamos a la función correcta de fastapi-users
            await self.request_verify(user, request)
        except Exception as e:
            print(f"❌ Error al solicitar la verificación para {user.email}: {e}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ):
        # Paso 2: fastapi-users nos da el token, y ahora sí enviamos el correo
        print(f"   -> Token generado. Enviando correo de verificación a {user.email}...")
        email_service.send_verification_email(user, token)
            
    async def on_after_forgot_password(
        self, user: User, token: str, request: Request | None = None
    ):
        print(f"Enviando correo de reseteo de contraseña a {user.email}...")
        email_service.send_reset_password_email(user, token)

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)