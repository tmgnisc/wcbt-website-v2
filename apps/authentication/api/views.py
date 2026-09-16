"""
Views for the authentication API.
"""

import logging

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.responses import error_response, success_response

from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    SignupSerializer,
    TokenRefreshSerializer,
    UserResponseSerializer,
)
from ..services import authenticate_user, create_user, logout_user

logger = logging.getLogger("apps")


class SignupView(generics.GenericAPIView):
    """Register a new user."""

    serializer_class = SignupSerializer
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            create_user(
                email=serializer.validated_data["email"],
                first_name=serializer.validated_data["first_name"],
                last_name=serializer.validated_data["last_name"],
                password=serializer.validated_data["password"],
            )
        except ValueError as e:
            return error_response(
                message=str(e),
                status=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(
            message="Account created successfully",
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    """Authenticate a user and return JWT tokens."""

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data = authenticate_user(
                identifier=serializer.validated_data["identifier"],
                password=serializer.validated_data["password"],
            )
        except ValueError as e:
            return error_response(
                message=str(e),
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return success_response(data=data, message="Login successful")


class TokenRefreshView(generics.GenericAPIView):
    """Refresh an access token."""

    serializer_class = TokenRefreshSerializer
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            data = {
                "access": str(token.access_token),
                "refresh": str(token),
            }
        except Exception:
            return error_response(
                message="Invalid or expired token.",
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return success_response(data=data, message="Token refreshed successfully")


class LogoutView(generics.GenericAPIView):
    """Blacklist the refresh token to log out."""

    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request) -> Response:
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            logout_user(serializer.validated_data["refresh"])
        except ValueError as e:
            return error_response(
                message=str(e),
                status=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(message="Logged out successfully")


class ProfileView(generics.GenericAPIView):
    """Return the authenticated user's profile."""

    serializer_class = UserResponseSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request) -> Response:
        serializer = self.get_serializer(request.user)
        return success_response(data=serializer.data)
