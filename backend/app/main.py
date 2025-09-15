from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_usuario      import router as usuario_router
from app.api.api_cuenta       import router as cuenta_router
from app.api.api_categoria    import router as categoria_router
from app.api.api_transaccion  import router as transaccion_router

from app.auth            import fastapi_users
from app.auth.jwt        import auth_backend
from app.auth.user_manager import get_user_manager
from app.schemas.usuario import UserRead, UserCreate, UserUpdate

load_dotenv(dotenv_path="../.env")  # carga tus vars de entorno

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # El origen de tu frontend de React
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los encabezados
)
# -----------------------------------

@app.get("/")
def read_root():
    return {"msg": "¡Hola, mundo! Proyecto de Presupuestos y Gastos."}

# Routers de la aplicación
app.include_router(usuario_router)
app.include_router(cuenta_router)
app.include_router(categoria_router)
app.include_router(transaccion_router)

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
)  # endpoints protegidos para gestión de usuarios :contentReference[oaicite:6]{index=6}
