from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"msg": "¡Hola, mundo! Proyecto de Presupuestos y Gastos."}