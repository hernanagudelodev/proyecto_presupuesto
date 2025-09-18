from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import calendar
from datetime import date
from app.models.transaccion import Transaccion # Importante para la validación

from app.models.regla_recurrente import ReglaRecurrente
from app.schemas.regla_recurrente import ReglaRecurrenteCreate, ReglaRecurrenteUpdate

# --- OBTENER REGLAS ---
async def get_regla(db: AsyncSession, regla_id: int, usuario_id: int) -> Optional[ReglaRecurrente]:
    """Obtiene una única regla por su ID, asegurando que pertenezca al usuario."""
    result = await db.execute(
        select(ReglaRecurrente).where(
            ReglaRecurrente.id == regla_id,
            ReglaRecurrente.usuario_id == usuario_id
        )
    )
    return result.scalar_one_or_none()

async def get_reglas_by_usuario(db: AsyncSession, usuario_id: int, skip: int = 0, limit: int = 100) -> List[ReglaRecurrente]:
    """Obtiene una lista de todas las reglas de un usuario."""
    result = await db.execute(
        select(ReglaRecurrente)
        .where(ReglaRecurrente.usuario_id == usuario_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

# --- CREAR REGLA ---
async def create_regla(db: AsyncSession, regla: ReglaRecurrenteCreate, usuario_id: int) -> ReglaRecurrente:
    """Crea una nueva regla recurrente en la base de datos."""
    # Combina los datos del esquema con el usuario_id
    db_regla = ReglaRecurrente(**regla.model_dump(), usuario_id=usuario_id)
    db.add(db_regla)
    await db.commit()
    await db.refresh(db_regla)
    return db_regla

# --- ACTUALIZAR REGLA ---
async def update_regla(db: AsyncSession, *, db_obj: ReglaRecurrente, obj_in: ReglaRecurrenteUpdate) -> ReglaRecurrente:
    """Actualiza una regla existente con los datos proporcionados."""
    # Convierte el esquema de Pydantic a un diccionario
    update_data = obj_in.model_dump(exclude_unset=True)
    # Itera sobre el diccionario y actualiza los campos del objeto de la base de datos
    for field, value in update_data.items():
        setattr(db_obj, field, value)

    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

# --- ELIMINAR REGLA ---
async def delete_regla(db: AsyncSession, regla_id: int, usuario_id: int) -> Optional[ReglaRecurrente]:
    """Elimina una regla de la base de datos."""
    # Primero, busca la regla para asegurarse de que existe y pertenece al usuario
    regla = await get_regla(db, regla_id, usuario_id)
    if regla:
        await db.delete(regla)
        await db.commit()
    return regla

async def generar_transacciones_planeadas(db: AsyncSession, usuario_id: int, year: int, month: int) -> List[Transaccion]:
    """
    Genera transacciones planeadas para un mes y año dados a partir de las reglas del usuario.
    """
    # 1. Obtiene todas las reglas del usuario
    reglas = await get_reglas_by_usuario(db=db, usuario_id=usuario_id, limit=1000) # Usamos un límite alto

    nuevas_transacciones = []

    # Itera sobre cada regla para generar sus transacciones
    for regla in reglas:
        if regla.frecuencia == 'Mensual':
            # Genera una transacción en el día especificado del mes
            dia = min(regla.dia, calendar.monthrange(year, month)[1]) # Asegura que el día no exceda el mes (ej. día 31 en febrero)
            fecha_transaccion = date(year, month, dia)

            transaccion = Transaccion(
                fecha=fecha_transaccion,
                valor=regla.valor_predeterminado,
                tipo=regla.tipo,
                descripcion=f"{regla.descripcion}",
                estado='Planeado',
                categoria_id=regla.categoria_predeterminada_id,
                usuario_id=usuario_id
            )
            nuevas_transacciones.append(transaccion)

        # --- LÓGICA PARA FRECUENCIA 'SEMANAL' ---
        elif regla.frecuencia == 'Semanal':
            # 'regla.dia' representa el día de la semana (0=Lunes, 6=Domingo)
            cal = calendar.Calendar()
            for week in cal.monthdatescalendar(year, month):
                for day in week:
                    if day.weekday() == regla.dia and day.month == month:
                        nuevas_transacciones.append(Transaccion(
                            fecha=day, valor=regla.valor_predeterminado, tipo=regla.tipo,
                            descripcion=f"{regla.descripcion}", estado='Planeado',
                            categoria_id=regla.categoria_predeterminada_id, usuario_id=usuario_id
                        ))

        # --- LÓGICA PARA FRECUENCIA 'ANUAL' ---
        elif regla.frecuencia == 'Anual':
            # Solo genera la transacción si el mes de la regla coincide con el mes solicitado
            if regla.mes == month:
                dia = min(regla.dia, calendar.monthrange(year, month)[1])
                fecha_transaccion = date(year, month, dia)
                nuevas_transacciones.append(Transaccion(
                    fecha=fecha_transaccion, valor=regla.valor_predeterminado, tipo=regla.tipo,
                    descripcion=f"{regla.descripcion}", estado='Planeado',
                    categoria_id=regla.categoria_predeterminada_id, usuario_id=usuario_id
                ))

    if nuevas_transacciones:
        db.add_all(nuevas_transacciones)
        await db.commit()

    return nuevas_transacciones