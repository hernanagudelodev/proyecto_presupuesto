#!/usr/bin/env python3
# backend/scripts/test_email_endpoints.py

import asyncio
import httpx

BASE_URL      = "http://localhost:8000"
SUPER_EMAIL   = "hernanagudelodev@gmail.com"

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Endpoint de solicitud de token de verificación
        resp_verify_req = await client.post(
            f"{BASE_URL}/auth/request-verify-token",
            json={"email": SUPER_EMAIL}
        )
        print("1) Solicitar token de verificación:",
              resp_verify_req.status_code, resp_verify_req.text)  # Should be 202 :contentReference[oaicite:0]{index=0}

        # 2. Endpoint de verificación (sin token, debe fallar)
        resp_verify = await client.post(
            f"{BASE_URL}/auth/verify",
            json={"token": "TOKEN_INVÁLIDO"}
        )
        print("2) Verificar con token inválido:",
              resp_verify.status_code, resp_verify.text)  # Espera 400 o 401 :contentReference[oaicite:1]{index=1}

        # 3. Endpoint de solicitud de reseteo de contraseña
        resp_forgot = await client.post(
            f"{BASE_URL}/auth/forgot-password",
            json={"email": SUPER_EMAIL}
        )
        print("3) Solicitar reseteo de contraseña:",
              resp_forgot.status_code, resp_forgot.text)  # Debe ser 202 :contentReference[oaicite:2]{index=2}

        # 4. Endpoint de reseteo de contraseña (sin token, debe fallar)
        resp_reset = await client.patch(
            f"{BASE_URL}/auth/reset-password",
            json={"token": "TOKEN_INVÁLIDO", "password": "NuevaPass123"}
        )
        print("4) Reseteo con token inválido:",
              resp_reset.status_code, resp_reset.text)  # Espera 400 o 401 :contentReference[oaicite:3]{index=3}

if __name__ == "__main__":
    asyncio.run(main())
