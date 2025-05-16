import os
from flask import Flask
from flask_cors import CORS
from extensions import db, logger # Import extensions

def create_app():
    app = Flask(__name__)

    # Database configuration
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "instance", "stitchpay.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Default Email Configuration (can be overridden by environment variables)
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True').lower() in ('true', 'yes', '1')
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'StitchPay <noreply@example.com>')

    # Initialize extensions with the app
    db.init_app(app)

    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",  # Allow all origins temporarily for debugging
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"],
            "supports_credentials": True
        }
    })

    # Import and register blueprints AFTER app and extensions are initialized
    from routes import bp as api_blueprint 
    app.register_blueprint(api_blueprint, url_prefix='/api')

    # Create database tables if they don't exist
    with app.app_context():
        # Import models here, only when needed for create_all, or ensure models.py only imports db from extensions
        # from models import PurchaseOrder # If needed for create_all to see them
        db.create_all()
        logger.info("Database tables checked/created.")

    # Use the init_mail function to initialize mail
    from extensions import init_mail
    init_mail(app)

    return app

if __name__ == '__main__':
    app = create_app()
    # Ensure instance directory exists
    instance_path = os.path.join(os.path.dirname(__file__), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    logger.info(f"Instance path: {instance_path}")
    logger.info("Starting StitchPay backend server...")
    app.run(host='0.0.0.0', debug=True, port=5000)
