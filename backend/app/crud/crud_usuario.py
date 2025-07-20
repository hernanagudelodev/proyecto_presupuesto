from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate
from typing import List, Optional
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def get_usuario(db: Session, usuario_id: int) -> Optional[Usuario]:
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str) -> Optional[Usuario]:
    return db.query(Usuario).filter(Usuario.email == email).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100) -> List[Usuario]:
    return db.query(Usuario).offset(skip).limit(limit).all()

def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    hashed_password = get_password_hash(usuario.password)
    db_usuario = Usuario(nombre=usuario.nombre, email=usuario.email, hashed_password=hashed_password)
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def delete_usuario(db: Session, usuario_id: int):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario:
        db.delete(usuario)
        db.commit()
