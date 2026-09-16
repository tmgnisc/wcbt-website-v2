"""
Views for OTP and password reset.
"""

import logging

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.common.responses import error_response, success_response
from apps.common.validators import validate_strong_password

from .serializers import (
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    SendOtpSerializer,
    VerifyOtpSerializer,
)
from ..services import (
    reset_password,
    send_password_reset_otp,
    send_verification_otp,
    verify_email_otp,
)

logger = logging.getLogger("apps")


class SendOtpView(generics.GenericAPIView):
    """Send email verification OTP to the authenticated user."""

    serializer_class = SendOtpSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request) -> Response:
        send_verification_otp(request.user)
        return success_response(message="Verification OTP sent to your email.")


class VerifyOtpView(generics.GenericAPIView):
    """Verify the email verification OTP."""

    serializer_class = VerifyOtpSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request) -> Response:
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        verified = verify_email_otp(
            user=request.user,
            otp_code=serializer.validated_data["otp_code"],
        )

        if not verified:
            return error_response(
                message="Invalid or expired OTP.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(message="Email verified successfully.")


class ForgotPasswordView(generics.GenericAPIView):
    """Send a password reset OTP to the given email."""

    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        from django.contrib.auth import get_user_model

        User = get_user_model()
        email = serializer.validated_data["email"]

        # Always return success to prevent email enumeration
        if User.objects.filter(email=email).exists():
            send_password_reset_otp(email)

        return success_response(
            message="If an account exists with this email, a reset code has been sent."
        )


class ResetPasswordView(generics.GenericAPIView):
    """Reset password using OTP."""

    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        try:
            validate_strong_password(data["new_password"])
        except Exception as e:
            return error_response(
                message=str(e),
                status=status.HTTP_400_BAD_REQUEST,
            )

        success = reset_password(
            email=data["email"],
            otp_code=data["otp_code"],
            new_password=data["new_password"],
        )

        if not success:
            return error_response(
                message="Invalid or expired OTP.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(message="Password reset successful.")
