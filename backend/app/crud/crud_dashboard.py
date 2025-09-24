from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, extract
from typing import List

from app.models.transaccion import Transaccion
from app.schemas.dashboard import ResumenMensual
from app.models.categoria import Categoria # <-- Importar Categoria
from app.schemas.dashboard import ResumenPorCategoria # <-- Importar el nuevo schema


async def get_resumen_mensual_por_ano(db: AsyncSession, usuario_id: int, year: int) -> List[ResumenMensual]:
    """
    Calcula el total de ingresos y gastos para cada mes de un año específico.
    Solo considera transacciones en estado 'Confirmado'.
    """
    # Usamos case() para sumar condicionalmente.
    # Si la transacción es 'Ingreso', sumamos su valor a 'total_ingresos'.
    # Si es 'Gasto', la sumamos a 'total_gastos'.
    ingresos = func.sum(case((Transaccion.tipo == 'Ingreso', Transaccion.valor), else_=0)).label('total_ingresos')
    gastos = func.sum(case((Transaccion.tipo == 'Gasto', Transaccion.valor), else_=0)).label('total_gastos')

    # Extraemos el mes de la fecha de la transacción para poder agrupar.
    mes = extract('month', Transaccion.fecha).label('mes')

    # Construimos la consulta principal.
    query = (
        select(mes, ingresos, gastos)
        .where(
            Transaccion.usuario_id == usuario_id,
            Transaccion.estado == 'Confirmado',
            extract('year', Transaccion.fecha) == year
        )
        .group_by(mes) # Agrupamos los resultados por mes.
        .order_by(mes) # Ordenamos por mes.
    )

    result = await db.execute(query)
    # Convertimos los resultados en una lista de objetos ResumenMensual.
    # Usamos un diccionario para manejar los meses que no tienen transacciones.
    resumen_dict = {row.mes: ResumenMensual(mes=row.mes, total_ingresos=row.total_ingresos, total_gastos=row.total_gastos) for row in result.all()}

    # Rellenamos los meses faltantes con ceros para que el gráfico sea consistente.
    resumen_final = []
    for i in range(1, 13):
        if i in resumen_dict:
            resumen_final.append(resumen_dict[i])
        else:
            resumen_final.append(ResumenMensual(mes=i, total_ingresos=0, total_gastos=0))

    return resumen_final



async def get_resumen_gastos_por_categoria(
    db: AsyncSession, usuario_id: int, year: int, month: int
) -> List[ResumenPorCategoria]:
    """
    Calcula el total de gastos por categoría para un mes y año específicos.
    """
    total_gastado = func.sum(Transaccion.valor).label('total_gastado')

    query = (
        select(Categoria.nombre.label('nombre_categoria'), total_gastado)
        .join(Categoria, Transaccion.categoria_id == Categoria.id) # Unimos las tablas Transaccion y Categoria
        .where(
            Transaccion.usuario_id == usuario_id,
            Transaccion.estado == 'Confirmado',
            Transaccion.tipo == 'Gasto', # Solo nos interesan los gastos
            extract('year', Transaccion.fecha) == year,
            extract('month', Transaccion.fecha) == month
        )
        .group_by(Categoria.nombre) # Agrupamos por el nombre de la categoría
        .order_by(total_gastado.desc()) # Ordenamos para ver las más importantes primero
    )

    result = await db.execute(query)
    return result.all()