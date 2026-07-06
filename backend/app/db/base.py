"""
SQLAlchemy declarative base.

All ORM models will inherit from `Base`. Kept in its own module (separate
from session.py) to avoid circular imports once models are added.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
