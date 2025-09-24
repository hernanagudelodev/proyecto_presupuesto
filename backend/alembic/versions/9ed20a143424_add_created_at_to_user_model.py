"""add created_at to user model

Revises: ...
Create Date: ...

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9ed20a143424' # <-- This will be different for you
down_revision: Union[str, Sequence[str], None] = 'e845ef126c54' # <-- This will be different for you
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'created_at')