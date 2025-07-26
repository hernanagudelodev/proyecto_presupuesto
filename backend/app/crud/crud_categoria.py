from sqlalchemy.orm import Session
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate
from typing import List, Optional

def get_categoria(db: Session, categoria_id: int, usuario_id: int) -> Optional[Categoria]:
    return db.query(Categoria).filter(
        Categoria.id == categoria_id,
        Categoria.usuario_id == usuario_id
    ).first()

def get_categorias_by_usuario(db: Session, usuario_id: int, skip=0, limit=100):
    return db.query(Categoria).filter(Categoria.usuario_id == usuario_id).offset(skip).limit(limit).all()

def create_categoria(db: Session, categoria: CategoriaCreate) -> Categoria:
    db_categoria = Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

def delete_categoria(db: Session, categoria_id: int):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if categoria:
        db.delete(categoria)
        db.commit()
