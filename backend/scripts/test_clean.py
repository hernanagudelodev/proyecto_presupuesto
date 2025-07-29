import httpx
import asyncio

BASE_URL = "http://localhost:8000"
TOKEN = "EL_TOKEN_DE_ADMIN_O_DEL_USUARIO"

headers = {"Authorization": f"Bearer {TOKEN}"}

async def main():
    async with httpx.AsyncClient() as client:
        # Borrar transacciones
        print("Obteniendo transacciones...")
        resp = await client.get(f"{BASE_URL}/transacciones/", headers=headers)
        for t in resp.json():
            r = await client.delete(f"{BASE_URL}/transacciones/{t['id']}", headers=headers)
            print("Delete transacción", t['id'], r.status_code)
        # Borrar categorías
        resp = await client.get(f"{BASE_URL}/categorias/", headers=headers)
        for c in resp.json():
            r = await client.delete(f"{BASE_URL}/categorias/{c['id']}", headers=headers)
            print("Delete categoría", c['id'], r.status_code)
        # Borrar cuentas
        resp = await client.get(f"{BASE_URL}/cuentas/", headers=headers)
        for c in resp.json():
            r = await client.delete(f"{BASE_URL}/cuentas/{c['id']}", headers=headers)
            print("Delete cuenta", c['id'], r.status_code)
        # Borrar usuario
        user_resp = await client.get(f"{BASE_URL}/users/me", headers=headers)
        if user_resp.status_code == 200:
            uid = user_resp.json()["id"]
            r = await client.delete(f"{BASE_URL}/users/{uid}", headers=headers)
            print("Delete usuario", uid, r.status_code)
        else:
            print("No se pudo obtener el usuario actual.", user_resp.status_code, user_resp.text)

if __name__ == "__main__":
    asyncio.run(main())
