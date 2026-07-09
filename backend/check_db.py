import sqlite3
con = sqlite3.connect('industrial_ki.db')
print(con.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall())
