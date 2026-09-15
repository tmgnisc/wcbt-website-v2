"""
Business logic for authentication.
"""

import logging

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.validators import validate_strong_password

User = get_user_model()
logger = logging.getLogger("apps")


def create_user(email: str, first_name: str, last_name: str, password: str) -> User:
    """Create a new user and return tokens."""
    validate_strong_password(password)

    if User.objects.filter(email=email).exists():
        raise ValueError("A user with this email already exists.")

    user = User.objects.create_user(
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=password,
    )
    logger.info("User created: %s", user.email)
    return user


def authenticate_user(email: str, password: str) -> dict:
    """Authenticate user and return JWT tokens."""
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        raise ValueError("Invalid credentials.")

    if not user.check_password(password):
        raise ValueError("Invalid credentials.")

    if not user.is_active:
        raise ValueError("This account is deactivated.")

    refresh = RefreshToken.for_user(user)

    logger.info("User logged in: %s", user.email)

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        },
    }


def logout_user(refresh_token: str) -> None:
    """Blacklist a refresh token to log the user out."""
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        logger.info("User logged out (token blacklisted).")
    except Exception:
        raise ValueError("Invalid or expired token.")
