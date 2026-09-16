"""
Models for OTP storage.
"""

from django.conf import settings
from django.db import models


class EmailVerification(models.Model):
    """Stores OTP codes for email verification."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_verifications",
    )
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"OTP for {self.user.email}"

    @property
    def is_expired(self) -> bool:
        from django.utils import timezone

        return timezone.now() > self.expires_at


class PasswordReset(models.Model):
    """Stores OTP codes for password reset."""

    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Password reset for {self.email}"

    @property
    def is_expired(self) -> bool:
        from django.utils import timezone

        return timezone.now() > self.expires_at
