"""
Serializers for OTP and password reset.
"""

from rest_framework import serializers


class SendOtpSerializer(serializers.Serializer):
    """Serializer for sending OTP — uses the authenticated user's email."""

    pass


class VerifyOtpSerializer(serializers.Serializer):
    """Serializer for verifying OTP."""

    otp_code = serializers.CharField(max_length=6)


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for requesting a password reset OTP."""

    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for resetting password with OTP."""

    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs: dict) -> dict:
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        return attrs
