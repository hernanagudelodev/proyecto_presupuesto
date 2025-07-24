import sys
import os
from logging.config import fileConfig
from app.db.base import Base

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Agrega la app al sys.path para que se puedan importar los modelos
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))

# --- LEER EL .env Y LA URL DE LA BASE DE DATOS ---
from dotenv import load_dotenv

# Cargar el archivo .env desde la carpeta backend
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

db_url = os.getenv("DATABASE_URL")
# --- FIN LECTURA .env ---

# this is the Alembic Config object, which provides access to the values within the .ini file in use.
config = context.config

# Si tienes db_url, úsala para la conexión
if db_url:
    config.set_main_option('sqlalchemy.url', db_url)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

""" # --- IMPORTA LOS MODELOS Y EL OBJETO Base ---
# Ajusta este import según dónde centralices tu Base y modelos
# Ejemplo recomendado: backend/app/db/base.py
try:
    from app.db.base import Base  # O donde declares tu Base y modelos
except ImportError:
    # Provisional: si no tienes aún el archivo base.py, puedes importar directamente algún modelo
    from app.models import Base
# -------------------------------------------- """

# Define el target_metadata para el autogenerate
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


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


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
