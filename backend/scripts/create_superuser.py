#!/usr/bin/env python3
# backend/scripts/clean_db.py

import sys, os
# Asegura que Python encuentre tu carpeta 'backend/'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import engine, async_session
from app.db.base_class import Base

# Importa todos los modelos para registrar relaciones
import app.models.usuario
import app.models.transaccion
import app.models.categoria
import app.models.cuenta

from app.models.transaccion import Transaccion
from app.models.categoria import Categoria
from app.models.cuenta import Cuenta
from app.models.usuario import User

async def main():
    # 1. Asegura que las tablas existen (opcional en dev)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Abre sesión asíncrona
    async with async_session() as session:  # type: AsyncSession
        # 3. Elimina todas las transacciones, categorías y cuentas
        await session.execute(delete(Transaccion))
        await session.execute(delete(Categoria))
        await session.execute(delete(Cuenta))
        # 4. Elimina todos los usuarios que NO sean superusuarios
        await session.execute(delete(User).where(User.is_superuser == False))
        # 5. Confirma los cambios
        await session.commit()
        print("✅ Base de datos limpiada, solo queda el superusuario.")

if __name__ == "__main__":
    asyncio.run(main())
