"""
Development settings.
"""

from .base import *  # noqa: F401, F403

DEBUG = os.getenv("DEBUG", "True").lower() == "true"  # noqa: F405

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")  # noqa: F405

# Database - MySQL via Laragon
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME", "college_db"),  # noqa: F405
        "USER": os.getenv("DB_USER", "root"),  # noqa: F405
        "PASSWORD": os.getenv("DB_PASSWORD", ""),  # noqa: F405
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),  # noqa: F405
        "PORT": os.getenv("DB_PORT", "3306"),  # noqa: F405
        "OPTIONS": {
            "charset": "utf8mb4",
        },
    }
}

CORS_ALLOWED_ORIGINS = os.getenv(  # noqa: F405
    "CORS_ALLOWED_ORIGINS", "http://localhost:3000"
).split(",")

CORS_ALLOW_CREDENTIALS = True
