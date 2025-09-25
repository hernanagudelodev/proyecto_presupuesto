import os
from fastapi import Depends, Request
from fastapi_users.manager import BaseUserManager, IntegerIDMixin

from app.models.usuario import User
from app.db.user_db import get_user_db
# Importamos la instancia de nuestro nuevo servicio de correo
from app.services.email_service import email_service

class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = os.environ["JWT_SECRET"]
    verification_token_secret = os.environ["JWT_SECRET"]

    async def on_after_register(self, user: User, request: Request | None = None):
        """
        Después de que un usuario se registra, usa el EmailService para enviar
        el correo de verificación.
        """
        print(f"✅ Usuario '{user.email}' registrado. Enviando correo de verificación...")
        try:
            # Generamos el token de verificación como siempre
            token = await self.create_verification_token(user)
            # Llamamos al método específico de nuestro servicio de correo
            email_service.send_verification_email(user, token)
        except Exception as e:
            print(f"❌ Error al solicitar la verificación para {user.email}: {e}")
            
    async def on_after_forgot_password(
        self, user: User, token: str, request: Request | None = None
    ):
        """
        Después de solicitar un reseteo de contraseña, usa el EmailService
        para enviar el correo correspondiente.
        """
        print(f"Enviando correo de reseteo de contraseña a {user.email}...")
        try:
            # Llamamos al método específico de nuestro servicio de correo
            email_service.send_reset_password_email(user, token)
        except Exception as e:
            print(f"Error enviando email de reseteo: {e}")

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)