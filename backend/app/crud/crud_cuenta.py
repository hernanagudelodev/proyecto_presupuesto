from sqlalchemy.orm import Session
from app.models.cuenta import Cuenta
from app.schemas.cuenta import CuentaCreate
from typing import List, Optional

def get_cuenta(db: Session, cuenta_id: int) -> Optional[Cuenta]:
    return db.query(Cuenta).filter(Cuenta.id == cuenta_id).first()

def get_cuentas_by_usuario(db: Session, usuario_id: int, skip: int = 0, limit: int = 100) -> List[Cuenta]:
    return db.query(Cuenta).filter(Cuenta.usuario_id == usuario_id).offset(skip).limit(limit).all()

def create_cuenta(db: Session, cuenta: CuentaCreate) -> Cuenta:
    db_cuenta = Cuenta(**cuenta.dict())
    db.add(db_cuenta)
    db.commit()
    db.refresh(db_cuenta)
    return db_cuenta

def delete_cuenta(db: Session, cuenta_id: int):
    cuenta = db.query(Cuenta).filter(Cuenta.id == cuenta_id).first()
    if cuenta:
        db.delete(cuenta)
        db.commit()
