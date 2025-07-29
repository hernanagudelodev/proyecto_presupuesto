import httpx
import asyncio
from datetime import date

BASE_URL = "http://localhost:8000"
USER_EMAIL = "prueba@correo.com"
USER_PASSWORD = "TestPassword123"

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Login para obtener el token
        print("Login...")
        resp = await client.post(f"{BASE_URL}/auth/jwt/login", data={
            "username": USER_EMAIL,
            "password": USER_PASSWORD
        })
        print("Login:", resp.status_code, resp.text)
        if resp.status_code != 200:
            print("No se pudo loguear, abortando pruebas.")
            return

        access_token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # 2. Obtener el usuario actual (verificación inicial)
        print("\nObteniendo usuario actual (/users/me)...")
        resp = await client.get(f"{BASE_URL}/users/me", headers=headers)
        print("Usuario actual:", resp.status_code, resp.text)
        usuario = resp.json()
        user_id = usuario.get("id")
        print("ID usuario:", user_id)

        # 3. Actualizar usuario para ponerlo como verificado
        print("\nActualizando usuario como verificado...")
        user_update = usuario.copy()
        user_update["is_verified"] = True
        resp = await client.patch(f"{BASE_URL}/users/{user_id}", json=user_update, headers=headers)
        print("Actualización usuario:", resp.status_code, resp.text)

        # 4. Verificar nuevamente
        print("\nVerificando usuario actualizado (/users/me)...")
        resp = await client.get(f"{BASE_URL}/users/me", headers=headers)
        print("Usuario actual (verificado):", resp.status_code, resp.text)

        # 5. Crear varias cuentas
        cuentas = [
            {"nombre": "Bancolombia", "tipo": "banco", "saldo_inicial": 1000000},
            {"nombre": "Nequi", "tipo": "banco", "saldo_inicial": 250000},
            {"nombre": "Efectivo", "tipo": "efectivo", "saldo_inicial": 50000},
        ]
        cuenta_ids = []
        for cuenta in cuentas:
            resp = await client.post(f"{BASE_URL}/cuentas/", json=cuenta, headers=headers)
            print(f"Crear cuenta {cuenta['nombre']}:", resp.status_code, resp.text)
            if resp.status_code == 200:
                cuenta_ids.append(resp.json()["id"])

        # 6. Listar cuentas
        resp = await client.get(f"{BASE_URL}/cuentas/", headers=headers)
        print("Cuentas:", resp.status_code, resp.text)

        # 7. Crear varias categorías
        categorias = [
            {"nombre": "Mercado", "tipo": "gasto"},
            {"nombre": "Salario", "tipo": "ingreso"},
            {"nombre": "Transporte", "tipo": "gasto"},
        ]
        categoria_ids = []
        for cat in categorias:
            resp = await client.post(f"{BASE_URL}/categorias/", json=cat, headers=headers)
            print(f"Crear categoría {cat['nombre']}:", resp.status_code, resp.text)
            if resp.status_code == 200:
                categoria_ids.append(resp.json()["id"])

        # 8. Listar categorías
        resp = await client.get(f"{BASE_URL}/categorias/", headers=headers)
        print("Categorías:", resp.status_code, resp.text)

        # 9. Crear varias transacciones
        transacciones = [
            {
                "fecha": date.today().isoformat(),
                "valor": 50000,
                "tipo": "gasto",
                "descripcion": "Compra mercado",
                "cuenta_id": cuenta_ids[0],
                "categoria_id": categoria_ids[0]
            },
            {
                "fecha": date.today().isoformat(),
                "valor": 2500000,
                "tipo": "ingreso",
                "descripcion": "Pago nómina",
                "cuenta_id": cuenta_ids[1],
                "categoria_id": categoria_ids[1]
            },
            {
                "fecha": date.today().isoformat(),
                "valor": 20000,
                "tipo": "gasto",
                "descripcion": "Transporte bus",
                "cuenta_id": cuenta_ids[2],
                "categoria_id": categoria_ids[2]
            }
        ]
        transaccion_ids = []
        for t in transacciones:
            resp = await client.post(f"{BASE_URL}/transacciones/", json=t, headers=headers)
            print(f"Crear transacción {t['descripcion']}:", resp.status_code, resp.text)
            if resp.status_code == 200:
                transaccion_ids.append(resp.json()["id"])

        # 10. Listar transacciones
        resp = await client.get(f"{BASE_URL}/transacciones/", headers=headers)
        print("Transacciones:", resp.status_code, resp.text)

        # 11. Obtener por ID, actualizar y eliminar (cuentas)
        for cuenta_id in cuenta_ids:
            resp = await client.get(f"{BASE_URL}/cuentas/{cuenta_id}", headers=headers)
            print(f"Cuenta {cuenta_id}:", resp.status_code, resp.text)
            if resp.status_code == 200:
                update_data = resp.json()
                update_data["saldo_inicial"] += 10000
                resp_update = await client.put(f"{BASE_URL}/cuentas/{cuenta_id}", json=update_data, headers=headers)
                print(f"Actualizar cuenta {cuenta_id}:", resp_update.status_code, resp_update.text)
                resp_delete = await client.delete(f"{BASE_URL}/cuentas/{cuenta_id}", headers=headers)
                print(f"Eliminar cuenta {cuenta_id}:", resp_delete.status_code)

        # 12. Igual para categorías
        for cat_id in categoria_ids:
            resp = await client.get(f"{BASE_URL}/categorias/{cat_id}", headers=headers)
            print(f"Categoría {cat_id}:", resp.status_code, resp.text)
            if resp.status_code == 200:
                update_data = resp.json()
                update_data["nombre"] += " Actualizada"
                resp_update = await client.put(f"{BASE_URL}/categorias/{cat_id}", json=update_data, headers=headers)
                print(f"Actualizar categoría {cat_id}:", resp_update.status_code, resp_update.text)
                resp_delete = await client.delete(f"{BASE_URL}/categorias/{cat_id}", headers=headers)
                print(f"Eliminar categoría {cat_id}:", resp_delete.status_code)

        # 13. Igual para transacciones
        for t_id in transaccion_ids:
            resp = await client.get(f"{BASE_URL}/transacciones/{t_id}", headers=headers)
            print(f"Transacción {t_id}:", resp.status_code, resp.text)
            if resp.status_code == 200:
                update_data = resp.json()
                update_data["valor"] += 1000
                resp_update = await client.put(f"{BASE_URL}/transacciones/{t_id}", json=update_data, headers=headers)
                print(f"Actualizar transacción {t_id}:", resp_update.status_code, resp_update.text)
                resp_delete = await client.delete(f"{BASE_URL}/transacciones/{t_id}", headers=headers)
                print(f"Eliminar transacción {t_id}:", resp_delete.status_code)

if __name__ == "__main__":
    asyncio.run(main())
