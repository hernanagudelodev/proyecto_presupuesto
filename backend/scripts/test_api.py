import requests

API_URL = "http://localhost:8000"

# 1. Crear usuario
usuario_data = {
    "nombre": "TestUser",
    "email": "testuser@example.com",
    "password": "123456"
}
r = requests.post(f"{API_URL}/usuarios/", json=usuario_data)
usuario = r.json()
print("Usuario creado:", usuario)
usuario_id = usuario["id"]

# 2. Crear cuentas
cuentas = [
    {"nombre": "Banco", "tipo": "Banco", "saldo_inicial": 1000.0, "usuario_id": usuario_id},
    {"nombre": "Efectivo", "tipo": "Efectivo", "saldo_inicial": 300.0, "usuario_id": usuario_id}
]
cuenta_ids = []
for cuenta in cuentas:
    r = requests.post(f"{API_URL}/cuentas/", json=cuenta)
    print("Cuenta creada:", r.json())
    cuenta_ids.append(r.json()["id"])

# 3. Crear categorías
categorias = [
    {"nombre": "Salario", "tipo": "Ingreso", "usuario_id": usuario_id},
    {"nombre": "Comida", "tipo": "Gasto", "usuario_id": usuario_id}
]
categoria_ids = []
for cat in categorias:
    r = requests.post(f"{API_URL}/categorias/", json=cat)
    print("Categoría creada:", r.json())
    categoria_ids.append(r.json()["id"])

# 4. Crear transacciones
transacciones = [
    {
        "fecha": "2025-07-24",
        "valor": 5000.0,
        "tipo": "Ingreso",
        "descripcion": "Pago mensual",
        "cuenta_id": cuenta_ids[0],
        "categoria_id": categoria_ids[0],
        "usuario_id": usuario_id
    },
    {
        "fecha": "2025-07-24",
        "valor": 200.0,
        "tipo": "Gasto",
        "descripcion": "Cena",
        "cuenta_id": cuenta_ids[1],
        "categoria_id": categoria_ids[1],
        "usuario_id": usuario_id
    }
]
transaccion_ids = []
for t in transacciones:
    r = requests.post(f"{API_URL}/transacciones/", json=t)
    print("Transacción creada:", r.json())
    transaccion_ids.append(r.json()["id"])

# 5. Listar todo por usuario
print("\n🏦 Listar cuentas:")
r = requests.get(f"{API_URL}/cuentas/usuario/{usuario_id}")
print(r.json())

print("\n📂 Listar categorías:")
r = requests.get(f"{API_URL}/categorias/usuario/{usuario_id}")
print(r.json())

print("\n💸 Listar transacciones:")
r = requests.get(f"{API_URL}/transacciones/usuario/{usuario_id}")
print(r.json())

# 6. Obtener cuenta por ID y usuario
print("\n🔍 Obtener cuenta:")
r = requests.get(f"{API_URL}/cuentas/{cuenta_ids[0]}/usuario/{usuario_id}")
print(r.json())

# 7. Eliminar cuenta
print("\n🗑️ Eliminar cuenta:")
r = requests.delete(f"{API_URL}/cuentas/{cuenta_ids[1]}")
print("Código de respuesta:", r.status_code)
