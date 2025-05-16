import sqlite3
import os
import sys

# Get the current directory of this script
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Path to the SQLite database
DB_PATH = os.path.join(BASE_DIR, 'instance', 'stitchpay.db')

print(f"Script running from: {os.getcwd()}")
print(f"Attempting to connect to database at: {DB_PATH}")
print(f"Database file exists: {os.path.exists(DB_PATH)}")

# Connect to the database
try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    print("Connected to database successfully")
except Exception as e:
    print(f"Error connecting to database: {str(e)}", file=sys.stderr)
    sys.exit(1)

try:
    # Check if the due_date column exists in purchase_orders
    cursor.execute("PRAGMA table_info(purchase_orders)")
    columns = [column[1] for column in cursor.fetchall()]
    print(f"Existing columns: {columns}")
    
    if 'due_date' not in columns:
        print("Adding due_date column to purchase_orders table...")
        cursor.execute("ALTER TABLE purchase_orders ADD COLUMN due_date TIMESTAMP")
        conn.commit()
        print("due_date column added successfully.")
    else:
        print("due_date column already exists in purchase_orders.")
    
    print("Database schema update process completed.")
except Exception as e:
    print(f"Error updating schema: {str(e)}", file=sys.stderr)
    conn.rollback()
finally:
    # Close the connection
    conn.close()
    print("Database connection closed.")
