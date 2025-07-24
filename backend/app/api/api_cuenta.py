from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.cuenta import CuentaCreate, CuentaResponse
import app.crud.crud_cuenta as crud

router = APIRouter(prefix="/cuentas", tags=["cuentas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=CuentaResponse)
def crear_cuenta(cuenta: CuentaCreate, db: Session = Depends(get_db)):
    return crud.create_cuenta(db, cuenta)

@router.get("/{cuenta_id}", response_model=CuentaResponse)
def obtener_cuenta(cuenta_id: int, db: Session = Depends(get_db)):
    cuenta = crud.get_cuenta(db, cuenta_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return cuenta

@router.get("/usuario/{usuario_id}", response_model=list[CuentaResponse])
def listar_cuentas_usuario(usuario_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_cuentas_by_usuario(db, usuario_id, skip, limit)

@router.delete("/{cuenta_id}", status_code=204)
def eliminar_cuenta(cuenta_id: int, db: Session = Depends(get_db)):
    crud.delete_cuenta(db, cuenta_id)
    return
