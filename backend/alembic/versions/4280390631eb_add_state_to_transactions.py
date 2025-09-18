"""Add state to transactions

Revision ID: 4280390631eb
Revises: b269c0508a9c # Asegúrate que este 'revises' coincida con el ID de la migración anterior
Create Date: 2025-09-18 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision: str = '4280390631eb'
down_revision: Union[str, Sequence[str], None] = '074b3a98fc40'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### Usamos el modo por lotes para añadir la columna de forma segura ###
    with op.batch_alter_table('transacciones', schema=None) as batch_op:
        batch_op.add_column(sa.Column('estado', sa.String(), nullable=False, server_default='Confirmado'))


def downgrade() -> None:
    # ### Revertimos los cambios también en modo por lotes ###
    with op.batch_alter_table('transacciones', schema=None) as batch_op:
        batch_op.drop_column('estado')