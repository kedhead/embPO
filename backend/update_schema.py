import sqlite3
import os

# Get the current directory of this script
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Path to the SQLite database
DB_PATH = os.path.join(BASE_DIR, 'instance', 'stitchpay.db')

print(f"Attempting to connect to database at: {DB_PATH}")

# Connect to the database
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    # Check if the due_date column exists in purchase_orders
    cursor.execute("PRAGMA table_info(purchase_orders)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'due_date' not in columns:
        print("Adding due_date column to purchase_orders table...")
        cursor.execute("ALTER TABLE purchase_orders ADD COLUMN due_date TIMESTAMP")
        conn.commit()
        print("due_date column added successfully.")
    else:
        print("due_date column already exists in purchase_orders.")

    # Remove email_settings table if it exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='email_settings'")
    table_exists = cursor.fetchone()

    if table_exists:
        print("Dropping email_settings table...")
        cursor.execute("DROP TABLE email_settings")
        conn.commit()
        print("email_settings table dropped successfully.")
    else:
        print("email_settings table does not exist, no action needed.")
    
    print("Database schema update process completed.")
except Exception as e:
    print(f"Error updating schema: {str(e)}")
    conn.rollback()
finally:
    # Close the connection
    conn.close()
