"""add image_prompt_template to user

Revision ID: 9b2e31f40c1a
Revises: 2ee80e1607aa
Create Date: 2026-03-14 11:57:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9b2e31f40c1a'
down_revision: Union[str, Sequence[str], None] = '2ee80e1607aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('image_prompt_template', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'image_prompt_template')
