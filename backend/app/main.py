from fastapi import FastAPI
from app.api.api_usuario import router as usuario_router
from app.api.api_cuenta import router as cuenta_router
from app.api.api_categoria import router as categoria_router
from app.api.api_transaccion import router as transaccion_router
from app.auth import fastapi_users
from app.auth.jwt import auth_backend
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse

from dotenv import load_dotenv
load_dotenv(dotenv_path="../.env")  # desde app/main.py



app = FastAPI()

@app.get("/")
def read_root():
    return {"msg": "¡Hola, mundo! Proyecto de Presupuestos y Gastos."}

app.include_router(usuario_router)
app.include_router(cuenta_router)
app.include_router(categoria_router)
app.include_router(transaccion_router)

# Rutas de autenticación y usuario
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"]
)

app.include_router(
    fastapi_users.get_register_router(UsuarioResponse, UsuarioCreate),
    prefix="/auth",
    tags=["auth"]
)

app.include_router(
    fastapi_users.get_users_router(UsuarioResponse),
    prefix="/users",
    tags=["users"]
)

