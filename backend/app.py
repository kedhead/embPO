import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, logger # Import extensions
from waitress import serve

def resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller"""
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(os.path.dirname(__file__))
    
    return os.path.join(base_path, relative_path)

def create_app():
    app = Flask(__name__, 
                template_folder=resource_path('templates'),
                static_folder=resource_path('static'))

    # Ensure instance directory exists
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    
    # Database configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "stitchpay.db")}'
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
    
    # Add global error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.exception("Unhandled exception occurred", exc_info=True)
        return jsonify({"error": str(e)}), 500

    # Add a direct health check route (not part of blueprints)
    @app.route('/health', methods=['GET'])
    def health_check():
        logger.info("Health check endpoint accessed")
        return jsonify({"status": "ok", "message": "Flask backend is running"}), 200

    # Add a root endpoint for direct access to the server
    @app.route('/', methods=['GET'])
    def root():
        logger.info("Root endpoint accessed")
        # List all registered routes for debugging
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append(str(rule))
        
        return jsonify({
            "status": "ok", 
            "message": "StitchPay API Server", 
            "version": "1.0.0",
            "routes": routes,
            "endpoints": ["/", "/health", "/api/health", "/api/test"]
        }), 200

    return app

if __name__ == '__main__':
    app = create_app()
    logger.info("Starting StitchPay backend server...")
    # Check if running as packaged app
    is_packaged = getattr(sys, 'frozen', False)
    logger.info(f"Running as packaged app: {is_packaged}")

    # Use Waitress for production
    if is_packaged:
        serve(app, host='0.0.0.0', port=5000)
    else:
        app.run(host='0.0.0.0', debug=True, port=5000)
