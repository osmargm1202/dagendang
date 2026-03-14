"""add article_prompt_template to user

Revision ID: c4f2fefb7d6a
Revises: b8b0f7d3c12d
Create Date: 2026-03-14 12:32:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4f2fefb7d6a'
down_revision: Union[str, Sequence[str], None] = 'b8b0f7d3c12d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('article_prompt_template', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'article_prompt_template')
