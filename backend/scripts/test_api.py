
import requests

API_URL = "http://localhost:8000"

usuario_data = {
    "email": "testfull@example.com",
    "password": "123456",
    "nombre": "Test Completo"
}

# 1. Registro
r = requests.post(f"{API_URL}/auth/register", json=usuario_data)
if r.status_code == 400:
    print("⚠️ Usuario ya existe, continuando...")
else:
    print("✅ Usuario registrado")

# 2. Login
login_data = {"username": usuario_data["email"], "password": usuario_data["password"]}
r = requests.post(f"{API_URL}/auth/jwt/login", data=login_data)
assert r.status_code == 200
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("🔐 Login exitoso")

# 3. Crear cuentas
cuentas = [
    {"nombre": "Banco Principal", "tipo": "Banco", "saldo_inicial": 1000},
    {"nombre": "Efectivo", "tipo": "Efectivo", "saldo_inicial": 300}
]
cuenta_ids = []
for c in cuentas:
    r = requests.post(f"{API_URL}/cuentas/", json=c, headers=headers)
    assert r.status_code == 200
    cuenta_ids.append(r.json()["id"])
print("✅ Cuentas creadas")

# 4. Crear categorías
categorias = [
    {"nombre": "Salario", "tipo": "Ingreso"},
    {"nombre": "Comida", "tipo": "Gasto"}
]
categoria_ids = []
for cat in categorias:
    r = requests.post(f"{API_URL}/categorias/", json=cat, headers=headers)
    assert r.status_code == 200
    categoria_ids.append(r.json()["id"])
print("✅ Categorías creadas")

# 5. Crear transacciones
transacciones = [
    {
        "fecha": "2025-07-24",
        "valor": 5000.0,
        "tipo": "Ingreso",
        "descripcion": "Sueldo",
        "cuenta_id": cuenta_ids[0],
        "categoria_id": categoria_ids[0]
    },
    {
        "fecha": "2025-07-24",
        "valor": 150.0,
        "tipo": "Gasto",
        "descripcion": "Almuerzo",
        "cuenta_id": cuenta_ids[1],
        "categoria_id": categoria_ids[1]
    }
]
transaccion_ids = []
for t in transacciones:
    r = requests.post(f"{API_URL}/transacciones/", json=t, headers=headers)
    assert r.status_code == 200
    transaccion_ids.append(r.json()["id"])
print("✅ Transacciones creadas")

# 6. Listar y validar
r = requests.get(f"{API_URL}/cuentas/", headers=headers)
print("📋 Cuentas:", r.json())

r = requests.get(f"{API_URL}/categorias/", headers=headers)
print("📂 Categorías:", r.json())

r = requests.get(f"{API_URL}/transacciones/", headers=headers)
print("💸 Transacciones:", r.json())

# 7. Obtener un recurso
r = requests.get(f"{API_URL}/cuentas/{cuenta_ids[0]}", headers=headers)
print("🔍 Cuenta específica:", r.json()["nombre"])

# 8. Eliminar una cuenta y categoría
r = requests.delete(f"{API_URL}/cuentas/{cuenta_ids[1]}", headers=headers)
assert r.status_code == 204
r = requests.delete(f"{API_URL}/categorias/{categoria_ids[1]}", headers=headers)
assert r.status_code == 204
print("🗑️ Recursos eliminados correctamente")
