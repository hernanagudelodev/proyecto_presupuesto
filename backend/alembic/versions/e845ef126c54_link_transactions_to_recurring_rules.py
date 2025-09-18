"""Link transactions to recurring rules

Revision ID: e845ef126c54 # Reemplaza con el ID de tu archivo
Revises: 4280390631eb # Reemplaza con el ID del archivo anterior
Create Date: 2025-09-18 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e845ef126c54'
down_revision: Union[str, Sequence[str], None] = '1ba37b0a7e8b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### Usamos el modo por lotes para añadir la columna y la relación ###
    with op.batch_alter_table('transacciones', schema=None) as batch_op:
        batch_op.add_column(sa.Column('regla_recurrente_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            'fk_transacciones_reglas_recurrentes', # Le damos un nombre explícito a la relación
            'reglas_recurrentes', 
            ['regla_recurrente_id'], 
            ['id']
        )


def downgrade() -> None:
    # ### Revertimos los cambios también en modo por lotes ###
    with op.batch_alter_table('transacciones', schema=None) as batch_op:
        batch_op.drop_constraint('fk_transacciones_reglas_recurrentes', type_='foreignkey')
        batch_op.drop_column('regla_recurrente_id')