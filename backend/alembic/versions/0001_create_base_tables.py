# backend/alembic/versions/0001_create_base_tables.py
"""Create base tables

Revision ID: 0001_create_base_tables
Revises: 
Create Date: 2025-09-24 16:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0001_create_base_tables'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### Create users table ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('hashed_password', sa.String(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('is_superuser', sa.Boolean(), nullable=False),
    sa.Column('is_verified', sa.Boolean(), nullable=False),
    sa.Column('nombre', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # ### Create categorias table ###
    op.create_table('categorias',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(), nullable=False),
    sa.Column('tipo', sa.String(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['usuario_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_categorias_id'), 'categorias', ['id'], unique=False)

    # ### Create cuentas table ###
    op.create_table('cuentas',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(), nullable=False),
    sa.Column('tipo', sa.String(), nullable=False),
    sa.Column('saldo_inicial', sa.Float(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['usuario_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cuentas_id'), 'cuentas', ['id'], unique=False)

    # ### Create reglas_recurrentes table ### (ESTA ES LA TABLA QUE FALTABA)
    op.create_table('reglas_recurrentes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('descripcion', sa.String(), nullable=False),
    sa.Column('valor_predeterminado', sa.Float(), nullable=False),
    sa.Column('tipo', sa.String(), nullable=False),
    sa.Column('frecuencia', sa.String(), nullable=False),
    sa.Column('dia', sa.Integer(), nullable=True),
    sa.Column('mes', sa.Integer(), nullable=True),
    sa.Column('categoria_predeterminada_id', sa.Integer(), nullable=True),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['categoria_predeterminada_id'], ['categorias.id'], ),
    sa.ForeignKeyConstraint(['usuario_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reglas_recurrentes_id'), 'reglas_recurrentes', ['id'], unique=False)

    # ### Create transacciones table ###
    op.create_table('transacciones',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('fecha', sa.Date(), nullable=False),
    sa.Column('valor', sa.Float(), nullable=False),
    sa.Column('tipo', sa.String(), nullable=False),
    sa.Column('descripcion', sa.String(), nullable=True),
    sa.Column('estado', sa.String(), nullable=False, server_default='Confirmado'),
    sa.Column('regla_recurrente_id', sa.Integer(), nullable=True),
    sa.Column('categoria_id', sa.Integer(), nullable=True),
    sa.Column('cuenta_origen_id', sa.Integer(), nullable=True),
    sa.Column('cuenta_destino_id', sa.Integer(), nullable=True),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['categoria_id'], ['categorias.id'], ),
    sa.ForeignKeyConstraint(['cuenta_destino_id'], ['cuentas.id'], ),
    sa.ForeignKeyConstraint(['cuenta_origen_id'], ['cuentas.id'], ),
    sa.ForeignKeyConstraint(['regla_recurrente_id'], ['reglas_recurrentes.id'], ),
    sa.ForeignKeyConstraint(['usuario_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transacciones_id'), 'transacciones', ['id'], unique=False)
    op.create_index(op.f('ix_transacciones_estado'), 'transacciones', ['estado'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_transacciones_estado'), table_name='transacciones')
    op.drop_index(op.f('ix_transacciones_id'), table_name='transacciones')
    op.drop_table('transacciones')
    op.drop_index(op.f('ix_reglas_recurrentes_id'), table_name='reglas_recurrentes')
    op.drop_table('reglas_recurrentes')
    op.drop_index(op.f('ix_cuentas_id'), table_name='cuentas')
    op.drop_table('cuentas')
    op.drop_index(op.f('ix_categorias_id'), table_name='categorias')
    op.drop_table('categorias')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')