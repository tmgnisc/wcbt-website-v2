"""
Business logic for OTP generation, sending, and verification.
"""

import logging
import random
import string

import resend
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.email_verification.models import EmailVerification, PasswordReset

User = get_user_model()
logger = logging.getLogger("apps")

OTP_EXPIRY_MINUTES = 5
OTP_LENGTH = 6


def _generate_otp() -> str:
    """Generate a random 6-digit OTP."""
    return "".join(random.choices(string.digits, k=OTP_LENGTH))


def _send_email(to: str, subject: str, html: str) -> None:
    """Send an email via Resend."""
    resend.api_key = settings.RESEND_API_KEY
    resend.Emails.send(
        {
            "from": settings.RESEND_FROM_EMAIL,
            "to": to,
            "subject": subject,
            "html": html,
        }
    )


def send_verification_otp(user) -> None:
    """Generate and send an email verification OTP."""
    # Invalidate any previous unused OTPs for this user
    EmailVerification.objects.filter(user=user, is_used=False).update(is_used=True)

    otp = _generate_otp()
    expires_at = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)

    EmailVerification.objects.create(
        user=user,
        otp_code=otp,
        expires_at=expires_at,
    )

    html = f"""
    <h2>Email Verification</h2>
    <p>Your verification code is:</p>
    <h1 style="letter-spacing: 8px; font-size: 32px;">{otp}</h1>
    <p>This code expires in {OTP_EXPIRY_MINUTES} minutes.</p>
    <p>If you did not request this, ignore this email.</p>
    """

    _send_email(user.email, "Verify Your Email", html)
    logger.info("Verification OTP sent to %s", user.email)


def verify_email_otp(user, otp_code: str) -> bool:
    """Verify the email verification OTP."""
    verification = (
        EmailVerification.objects.filter(user=user, is_used=False)
        .order_by("-created_at")
        .first()
    )

    if not verification:
        return False

    if verification.is_expired:
        return False

    if verification.otp_code != otp_code:
        return False

    verification.is_used = True
    verification.save(update_fields=["is_used"])
    return True


def send_password_reset_otp(email: str) -> None:
    """Generate and send a password reset OTP."""
    # Invalidate any previous unused OTPs for this email
    PasswordReset.objects.filter(email=email, is_used=False).update(is_used=True)

    otp = _generate_otp()
    expires_at = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)

    PasswordReset.objects.create(
        email=email,
        otp_code=otp,
        expires_at=expires_at,
    )

    html = f"""
    <h2>Password Reset</h2>
    <p>Your password reset code is:</p>
    <h1 style="letter-spacing: 8px; font-size: 32px;">{otp}</h1>
    <p>This code expires in {OTP_EXPIRY_MINUTES} minutes.</p>
    <p>If you did not request this, ignore this email.</p>
    """

    _send_email(email, "Reset Your Password", html)
    logger.info("Password reset OTP sent to %s", email)


def verify_password_reset_otp(email: str, otp_code: str) -> bool:
    """Verify the password reset OTP."""
    reset = (
        PasswordReset.objects.filter(email=email, is_used=False)
        .order_by("-created_at")
        .first()
    )

    if not reset:
        return False

    if reset.is_expired:
        return False

    if reset.otp_code != otp_code:
        return False

    reset.is_used = True
    reset.save(update_fields=["is_used"])
    return True


def reset_password(email: str, otp_code: str, new_password: str) -> bool:
    """Verify OTP and set a new password."""
    if not verify_password_reset_otp(email, otp_code):
        return False

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return False

    user.set_password(new_password)
    user.save(update_fields=["password"])
    logger.info("Password reset successful for %s", email)
    return True
