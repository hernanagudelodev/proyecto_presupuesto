"""add created_at to user model

Revision ID: 9ed20a143424
Revises: e845ef126c54
Create Date: ...

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9ed20a143424'
down_revision: Union[str, Sequence[str], None] = 'e845ef126c54'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### Usamos el modo por lotes para añadir la columna de forma segura ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # ### Revertimos los cambios también en modo por lotes ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('created_at')