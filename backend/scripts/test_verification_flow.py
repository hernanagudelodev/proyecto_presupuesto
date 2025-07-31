#!/usr/bin/env python3
# backend/scripts/test_verification_flow.py

import asyncio
import sys
import os

# Permite importar tu aplicación
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import httpx
from app.db.session import async_session
from app.models.usuario import User
from app.auth.user_manager import UserManager, get_user_db
from fastapi import Depends
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

# Ajusta si tu endpoint difiere
BASE_URL       = "http://localhost:8000"
TEST_PASSWORD  = "TestPass123"
TEST_NOMBRE    = "Usuario Test"

async def generate_token_for(email: str) -> str:
    """
    Genera el token de verificación directamente desde el UserManager,
    sin depender del email.
    """
    # Creamos un session local para el user_db
    async with async_session() as db:
        user_db = SQLAlchemyUserDatabase(db, User)
        manager = UserManager(user_db)
        # Obtenemos el usuario
        user = await db.execute(
            User.__table__.select().where(User.email == email)
        )
        user = user.scalar_one_or_none()
        if not user:
            raise ValueError(f"Usuario {email!r} no encontrado en la base")
        # Generamos el token
        return await manager.generate_verification_token(user)

async def main():
    async with httpx.AsyncClient() as client:
        # 1) Registrar usuario de prueba
        test_email = f"test_{os.urandom(3).hex()}@correo.com"
        print("► Registrando:", test_email)
        r = await client.post(
            f"{BASE_URL}/auth/register",
            json={"email": test_email, "password": TEST_PASSWORD, "nombre": TEST_NOMBRE}
        )
        print("Registro:", r.status_code, r.json())
        if r.status_code not in (200, 201):
            return

        # 2) Solicitar token de verificación por correo
        print("\n► Solicitar verify-token")
        r = await client.post(
            f"{BASE_URL}/auth/request-verify-token",
            json={"email": test_email}
        )
        print("Request-verify-token:", r.status_code, r.text)

        # 3) Generar token internamente (para pruebas) 
        token = await generate_token_for(test_email)
        print("\n► Token generado internamente:", token)

        # 4) Consumir endpoint de verificación
        print("\n► Llamando a /auth/verify …")
        r = await client.patch(
            f"{BASE_URL}/auth/verify",
            json={"token": token}
        )
        print("Verify:", r.status_code, r.text)

        # 5) Intentar login (debe funcionar ahora)
        print("\n► Intentando login tras verify …")
        r = await client.post(
            f"{BASE_URL}/auth/jwt/login",
            data={"username": test_email, "password": TEST_PASSWORD}
        )
        print("Login:", r.status_code, r.json())

if __name__ == "__main__":
    asyncio.run(main())

