"""
Configuration Module - Environment-based settings for HealSpace AI
"""

import os
from datetime import timedelta


class Config:
    """Base configuration"""

    # SECRET_KEY MUST be set as a Railway env var.
    # If missing, a truly random key is generated — but sessions won't survive restarts.
    _raw_secret = os.getenv('SECRET_KEY', '').strip()
    if not _raw_secret:
        import secrets as _secrets
        _raw_secret = _secrets.token_hex(32)
        print("WARNING: SECRET_KEY env var not set! Sessions won't survive app restarts. "
              "Set SECRET_KEY in Railway Variables.")
    SECRET_KEY = _raw_secret

    # Database — Railway provides DATABASE_URL as postgres:// but SQLAlchemy needs postgresql://
    _db_url = os.getenv('DATABASE_URL', 'sqlite:///healspace.db')
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,    # test connection before use
        'pool_recycle': 300,      # recycle connections every 5 min
    }

    # Session — cookie-based (NOT filesystem — Railway FS is ephemeral)
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_SECURE = os.getenv('FLASK_ENV', 'development') == 'production'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # Flask-Login
    REMEMBER_COOKIE_DURATION = timedelta(days=30)

    # Legacy API keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True   # Railway always serves over HTTPS


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get configuration based on FLASK_ENV"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
