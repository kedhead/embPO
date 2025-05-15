import os
from extensions import app, db
import models
import routes

def init_db():
    """Initialize the database and create all tables."""
    with app.app_context():
        db.create_all()
        print("Database initialized")

if __name__ == '__main__':
    # Ensure instance directory exists
    os.makedirs(os.path.join(os.path.dirname(__file__), 'instance'), exist_ok=True)
    
    # Initialize database
    init_db()
    
    # Run the app
    app.run(host='0.0.0.0', debug=True, port=5000)
