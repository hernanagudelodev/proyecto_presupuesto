#!/usr/bin/env python3
# backend/scripts/test_verification_login.py

import httpx
import asyncio
import uuid

BASE_URL = "http://localhost:8000"
SUPER_EMAIL      = "hernanagudelodev@gmail.com"
SUPER_PASSWORD   = "TuPasswordSegura123"
TEST_EMAIL       = f"hhagudelo53@gmail.com"
TEST_PASSWORD    = "TestPass123"
TEST_NOMBRE      = "Usuario Test"

async def main():
    async with httpx.AsyncClient() as client:
        # # 1. Registrar un usuario de prueba (no verificado)
        # print("► Registrando usuario de prueba…")
        # resp = await client.post(
        #     f"{BASE_URL}/auth/register",
        #     json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "nombre": TEST_NOMBRE}
        # )
        # print("Registro testuser:", resp.status_code)
        # if resp.status_code not in (200, 201):
        #     print("  ❌ Falló el registro, abortando.")
        #     return

        # # 2. Intentar login con ese usuario (debería 401)
        # print("\n► Intentando login con usuario NO verificado…")
        # resp = await client.post(
        #     f"{BASE_URL}/auth/jwt/login",
        #     data={"username": TEST_EMAIL, "password": TEST_PASSWORD}
        # )
        # print("Login testuser:", resp.status_code, resp.text)

        # 3. Intentar login con superusuario (ya verificado, debería 200)
        print("\n► Intentando login con superusuario VERIFICADO…")
        resp = await client.post(
            f"{BASE_URL}/auth/jwt/login",
            data={"username": SUPER_EMAIL, "password": SUPER_PASSWORD}
        )
        print("Login superuser:", resp.status_code, resp.text)

        # 4. (Opcional) Limpiar usuario de prueba si quieres
        token = resp.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}

        resp_delete = await client.delete(
            f"{BASE_URL}/users/3",
            headers=headers
        )
        print("Eliminación testuser:", resp_delete.status_code, resp_delete.text)

if __name__ == "__main__":
    asyncio.run(main())
