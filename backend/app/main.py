from fastapi import FastAPI
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

# from app.api.api_usuario      import router as usuario_router -- se reemplaza por FastAPI Users
from app.api.api_cuenta       import router as cuenta_router
from app.api.api_categoria    import router as categoria_router
from app.api.api_transaccion  import router as transaccion_router
from app.api.api_regla_recurrente import router as regla_router
from app.api.api_dashboard import router as dashboard_router
from app.api.api_user import router as user_admin_router

from app.auth            import fastapi_users
from app.auth.jwt        import auth_backend
from app.auth.user_manager import get_user_manager
from app.schemas.usuario import UserRead, UserCreate, UserUpdate

load_dotenv(dotenv_path="../.env")  # carga tus vars de entorno

app = FastAPI()

# Lee los orígenes permitidos desde una variable de entorno
# El valor por defecto ("http://localhost:5173") es para seguir trabajando en local
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Usa la lista de orígenes que acabamos de leer
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"msg": "¡Hola, mundo! Proyecto de Presupuestos y Gastos."}

# Routers de la aplicación
# app.include_router(usuario_router) --- se reemplaza por el siguiente bloque de FastAPI Users
app.include_router(cuenta_router)
app.include_router(categoria_router)
app.include_router(transaccion_router)
app.include_router(regla_router)
app.include_router(dashboard_router)
app.include_router(user_admin_router)

# 1. Login JWT (solo usuarios verificados)
app.include_router(
    fastapi_users.get_auth_router(auth_backend, requires_verification=True),
    prefix="/auth/jwt",
    tags=["auth"],
)  # exige is_verified=True en /auth/jwt/login :contentReference[oaicite:2]{index=2}

# 2. Registro de usuarios (envía token en on_after_register)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)  # registro + hook de envío de verificación :contentReference[oaicite:3]{index=3}

# 3. Verificación de email
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)  # expone /auth/request-verify-token y /auth/verify :contentReference[oaicite:4]{index=4}

# 4. Reseteo de contraseña
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)  # expone /auth/forgot-password y /auth/reset-password :contentReference[oaicite:5]{index=5}


# 5. CRUD de usuarios
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)
