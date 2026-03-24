"""user_id migration - mark current schema as migrated

Revision ID: user_id_migration
Revises: 143a35ac668d
Create Date: 2026-03-24

Note: Tables already exist with user_id as PK.
This migration marks the current state as migrated.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "user_id_migration"
down_revision: Union[str, Sequence[str], None] = "143a35ac668d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Mark current schema as migrated (tables already exist)."""
    pass


def downgrade() -> None:
    """Downgrade not supported for this migration."""
    pass
