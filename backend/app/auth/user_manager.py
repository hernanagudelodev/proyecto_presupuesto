# backend/app/auth/user_manager.py

import os # <-- Asegúrate de que 'os' esté importado
from fastapi import Depends, Request
from fastapi_users.manager import BaseUserManager, IntegerIDMixin
from fastapi_mail import MessageSchema

from app.models.usuario import User
from app.db.user_db import get_user_db
from app.auth.email import fm, env

# ... (API_URL no la necesitamos aquí, la podemos quitar si quieres)

class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = os.environ["JWT_SECRET"]
    verification_token_secret = os.environ["JWT_SECRET"]

    # ... (on_after_register y on_after_request_verify no cambian) ...
    async def on_after_register(self, user: User, request: Request | None = None):
        print(f"✅ Usuario '{user.email}' registrado exitosamente.")
        print("⏳ Solicitando el envío del token de verificación...")
        try:
            await self.request_verify(user, request)
            print(f"📨 Solicitud de verificación para '{user.email}' procesada.")
        except Exception as e:
            print(f"❌ Error al solicitar la verificación para {user.email}: {e}")
            
    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ):
        print(f"   -> Generando y enviando correo de verificación para '{user.email}'...")
        
        # Leemos la URL del frontend desde el .env
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        # Creamos el enlace apuntando a la nueva página del frontend
        link = f"{frontend_url}/verify-email?token={token}"
        
        html = env.get_template("verify.html").render(user=user, link=link)

        message = MessageSchema(
            subject="Activa tu cuenta",
            recipients=[user.email],
            body=html,
            subtype="html",
        )

        await fm.send_message(message)
        print(f"   -> ✅ Correo de verificación para '{user.email}' enviado.")


    async def on_after_forgot_password(self, user: User, token: str, request: Request | None = None):
        print(f"Enviando correo de reseteo de contraseña a {user.email}")
        
        # --- ESTA ES LA LÍNEA CORREGIDA ---
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        link = f"{frontend_url}/auth/reset-password?token={token}"
        
        html = env.get_template("reset.html").render(user=user, link=link)
        message = MessageSchema(
            subject="Recupera tu contraseña",
            recipients=[user.email],
            body=html,
            subtype="html",
        )
        try:
            await fm.send_message(message)
            print(f"Correo de reseteo enviado a {user.email}")
        except Exception as e:
            print(f"Error enviando email de reseteo: {e}")

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)