from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
import logging
import os

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler() # Log to console
    ]
)
logger = logging.getLogger('stitchpay')

# Initialize extensions instances.
# They will be initialized with the Flask app object in app.py (or create_app).
db = SQLAlchemy()
mail = Mail()

def init_mail(app):
    """Initialize the mail extension with the Flask app."""
    mail.init_app(app)

__all__ = ['db', 'logger', 'mail']
