from app.db.base import Base
from app.db.session import engine
import app.models

print("Tables registered in metadata:", list(Base.metadata.tables.keys()))

Base.metadata.create_all(bind=engine)
print("create_all() ran without error")

import sqlite3
con = sqlite3.connect("industrial_ki.db")
print("Tables in actual .db file:", con.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall())