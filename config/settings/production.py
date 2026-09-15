"""
Production settings.
"""

from .base import *  # noqa: F401, F403

DEBUG = False

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")  # noqa: F405

# Database - MySQL for production
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME"),  # noqa: F405
        "USER": os.getenv("DB_USER"),  # noqa: F405
        "PASSWORD": os.getenv("DB_PASSWORD"),  # noqa: F405
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),  # noqa: F405
        "PORT": os.getenv("DB_PORT", "3306"),  # noqa: F405
        "OPTIONS": {
            "charset": "utf8mb4",
        },
    }
}

CORS_ALLOWED_ORIGINS = os.getenv(  # noqa: F405
    "CORS_ALLOWED_ORIGINS", ""
).split(",")

CORS_ALLOW_CREDENTIALS = True

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
