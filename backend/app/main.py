from fastapi import FastAPI
from app.api.api_usuario import router as usuario_router

app = FastAPI()

@app.get("/")
def read_root():
    return {"msg": "¡Hola, mundo! Proyecto de Presupuestos y Gastos."}

app.include_router(usuario_router)
