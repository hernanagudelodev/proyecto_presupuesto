import sys
import os
import asyncio
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import AsyncEngine

from alembic import context

# Agrega la app al sys.path para que se puedan importar los modelos
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# --- LEER EL .env Y LA URL DE LA BASE DE DATOS ---
from dotenv import load_dotenv

# Importa tu Base de SQLAlchemy y todos los modelos para que Alembic los detecte
from app.db.base import Base 

# Cargar el archivo .env desde la carpeta backend
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

db_url = os.getenv("DATABASE_URL")

# --- ¡AQUÍ ESTÁ LA MISMA CORRECCIÓN! ---
# Si la URL es de Postgres, nos aseguramos de que use el driver asyncpg
if db_url and db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
# --- FIN DE LA CORRECCIÓN ---


# this is the Alembic Config object, which provides access to the values within the .ini file in use.
config = context.config

# Si tienes db_url, úsala para la conexión
if db_url:
    config.set_main_option('sqlalchemy.url', db_url)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Define el target_metadata para el autogenerate
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """Función auxiliar que Alembic ejecutará de forma síncrona."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Función principal asíncrona para ejecutar las migraciones."""
    connectable = AsyncEngine(
        engine_from_config(
            config.get_section(config.config_ini_section, {}),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())