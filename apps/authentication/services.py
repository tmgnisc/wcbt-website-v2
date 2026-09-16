"""
Business logic for authentication.
"""

import logging

from django.contrib.auth import get_user_model
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


def authenticate_user(identifier: str, password: str) -> dict:
    """Authenticate user by email or username and return JWT tokens."""
    if "@" in identifier:
        user = User.objects.filter(email__iexact=identifier).first()
    else:
        user = User.objects.filter(username__iexact=identifier).first()

    if user is None:
        raise ValueError("Invalid credentials.")

    if not user.check_password(password):
        raise ValueError("Invalid credentials.")

    if not user.is_active:
        raise ValueError("This account is deactivated.")

    refresh = RefreshToken.for_user(user)

    logger.info("User logged in: %s", user.email)

    return {
        "user": {
            "id": str(user.id),
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "avatarUrl": None,
        },
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def logout_user(refresh_token: str) -> None:
    """Blacklist a refresh token to log the user out."""
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        logger.info("User logged out (token blacklisted).")
    except Exception:
        raise ValueError("Invalid or expired token.")
