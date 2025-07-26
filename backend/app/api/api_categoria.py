from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.categoria import CategoriaCreate, CategoriaResponse
import app.crud.crud_categoria as crud

router = APIRouter(prefix="/categorias", tags=["categorias"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=CategoriaResponse)
def crear_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    return crud.create_categoria(db, categoria)

@router.get("/{categoria_id}/usuario/{usuario_id}", response_model=CategoriaResponse)
def obtener_categoria(categoria_id: int, usuario_id: int, db: Session = Depends(get_db)):
    categoria = crud.get_categoria(db, categoria_id, usuario_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria

@router.get("/usuario/{usuario_id}", response_model=list[CategoriaResponse])
def listar_categorias_usuario(usuario_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_categorias_by_usuario(db, usuario_id, skip, limit)

@router.delete("/{categoria_id}", status_code=204)
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    crud.delete_categoria(db, categoria_id)
    return
