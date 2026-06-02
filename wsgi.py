"""
WSGI entry point for Gunicorn
Ensures the Flask app is properly configured for production deployment
"""
import os
import sys
from app import app

# Set environment to production if not already set
if not os.getenv('FLASK_ENV'):
    os.environ['FLASK_ENV'] = 'production'

if __name__ == '__main__':
    # For local testing
    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
