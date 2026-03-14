"""add gemini_image_size to user

Revision ID: b8b0f7d3c12d
Revises: 9b2e31f40c1a
Create Date: 2026-03-14 12:28:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8b0f7d3c12d'
down_revision: Union[str, Sequence[str], None] = '9b2e31f40c1a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('gemini_image_size', sa.String(length=10), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'gemini_image_size')
