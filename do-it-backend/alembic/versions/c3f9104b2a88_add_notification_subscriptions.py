"""add notification_subscriptions

Revision ID: c3f9104b2a88
Revises: e51f87b2c9a1
Create Date: 2026-09-17 01:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'c3f9104b2a88'
down_revision = 'e51f87b2c9a1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'notification_subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('endpoint', sa.Text(), nullable=False),
        sa.Column('p256dh', sa.String(length=255), nullable=False),
        sa.Column('auth', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notification_subscriptions_endpoint'), 'notification_subscriptions', ['endpoint'], unique=True)
    op.create_index(op.f('ix_notification_subscriptions_user_id'), 'notification_subscriptions', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_notification_subscriptions_user_id'), table_name='notification_subscriptions')
    op.drop_index(op.f('ix_notification_subscriptions_endpoint'), table_name='notification_subscriptions')
    op.drop_table('notification_subscriptions')
