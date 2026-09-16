"""
Serializers for the authentication API.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class SignupSerializer(serializers.Serializer):
    """Serializer for user registration."""

    email = serializers.EmailField(max_length=255)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)
    remember = serializers.BooleanField(required=False, default=False)


class TokenRefreshSerializer(serializers.Serializer):
    """Serializer for token refresh."""

    refresh = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    """Serializer for user logout."""

    refresh = serializers.CharField()


class UserResponseSerializer(serializers.ModelSerializer):
    """Serializer for user data in responses."""

    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    def get_full_name(self, obj: User) -> str:
        return obj.full_name

    def get_avatar_url(self, obj: User) -> str | None:
        return None

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "avatar_url",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
