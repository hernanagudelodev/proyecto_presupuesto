from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
import app.crud.crud_usuario as crud

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=UsuarioResponse)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = crud.get_usuario_by_email(db, usuario.email)
    if db_usuario:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return crud.create_usuario(db, usuario)

@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = crud.get_usuario(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.get("/", response_model=list[UsuarioResponse])
def listar_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_usuarios(db, skip=skip, limit=limit)

@router.delete("/{usuario_id}", status_code=204)
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    crud.delete_usuario(db, usuario_id)
    return
