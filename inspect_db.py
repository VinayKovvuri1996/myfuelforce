import sqlite3

try:
    conn = sqlite3.connect('gas_station.db') # Database is in root now
    cursor = conn.cursor()
    
    print("--- Users Table Columns ---")
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    for col in columns:
        print(col)
        
    print("\n--- Registered Users ---")
    cursor.execute("SELECT id, username, email, hashed_password FROM users")
    users = cursor.fetchall()
    for user in users:
        print(f"ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Hash: {user[3][:20]}...")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
