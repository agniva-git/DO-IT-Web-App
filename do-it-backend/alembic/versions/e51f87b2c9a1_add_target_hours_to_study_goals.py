"""add target_hours to study_goals

Revision ID: e51f87b2c9a1
Revises: 9a434b7e2b40
Create Date: 2026-09-15 13:02:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e51f87b2c9a1'
down_revision = '9a434b7e2b40'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('study_goals', sa.Column('target_hours', sa.Float(), nullable=True, server_default='0.0'))


def downgrade() -> None:
    op.drop_column('study_goals', 'target_hours')
