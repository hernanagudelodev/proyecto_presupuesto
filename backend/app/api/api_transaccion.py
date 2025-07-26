from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.transaccion import TransaccionCreate, TransaccionResponse
import app.crud.crud_transaccion as crud

router = APIRouter(prefix="/transacciones", tags=["transacciones"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=TransaccionResponse)
def crear_transaccion(transaccion: TransaccionCreate, db: Session = Depends(get_db)):
    return crud.create_transaccion(db, transaccion)

@router.get("/{transaccion_id}/usuario/{usuario_id}", response_model=TransaccionResponse)
def obtener_transaccion(transaccion_id: int, usuario_id: int, db: Session = Depends(get_db)):
    transaccion = crud.get_transaccion(db, transaccion_id, usuario_id)
    if not transaccion:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    return transaccion

@router.get("/usuario/{usuario_id}", response_model=list[TransaccionResponse])
def listar_transacciones_usuario(usuario_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_transacciones_by_usuario(db, usuario_id, skip, limit)

@router.get("/cuenta/{cuenta_id}", response_model=list[TransaccionResponse])
def listar_transacciones_cuenta(cuenta_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_transacciones_by_cuenta(db, cuenta_id, skip, limit)

@router.delete("/{transaccion_id}", status_code=204)
def eliminar_transaccion(transaccion_id: int, db: Session = Depends(get_db)):
    crud.delete_transaccion(db, transaccion_id)
    return
