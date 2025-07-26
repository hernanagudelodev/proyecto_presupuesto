from sqlalchemy.orm import Session
from app.models.transaccion import Transaccion
from app.schemas.transaccion import TransaccionCreate
from typing import List, Optional

def get_transaccion(db: Session, transaccion_id: int, usuario_id: int) -> Optional[Transaccion]:
    return db.query(Transaccion).filter(
        Transaccion.id == transaccion_id,
        Transaccion.usuario_id == usuario_id
    ).first()

def get_transacciones_by_usuario(db: Session, usuario_id: int, skip=0, limit=100):
    return db.query(Transaccion).filter(Transaccion.usuario_id == usuario_id).offset(skip).limit(limit).all()

def get_transacciones_by_cuenta(db: Session, cuenta_id: int, skip: int = 0, limit: int = 100) -> List[Transaccion]:
    return db.query(Transaccion).filter(Transaccion.cuenta_id == cuenta_id).offset(skip).limit(limit).all()

def create_transaccion(db: Session, transaccion: TransaccionCreate) -> Transaccion:
    db_transaccion = Transaccion(**transaccion.dict())
    db.add(db_transaccion)
    db.commit()
    db.refresh(db_transaccion)
    return db_transaccion

def delete_transaccion(db: Session, transaccion_id: int):
    transaccion = db.query(Transaccion).filter(Transaccion.id == transaccion_id).first()
    if transaccion:
        db.delete(transaccion)
        db.commit()
