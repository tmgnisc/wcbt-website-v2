"""
Tests for OTP verification and password reset.
"""

from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework import status

from apps.email_verification.models import EmailVerification, PasswordReset

User = get_user_model()


@pytest.mark.django_db
class TestSendOtp:
    """Tests for POST /api/auth/send-otp/"""

    @patch("apps.email_verification.services._send_email")
    def test_send_otp_success(self, mock_send, auth_client, user):
        response = auth_client.post("/api/auth/send-otp/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        mock_send.assert_called_once()
        assert EmailVerification.objects.filter(user=user).exists()

    def test_send_otp_unauthenticated(self, api_client):
        response = api_client.post("/api/auth/send-otp/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @patch("apps.email_verification.services._send_email")
    def test_send_otp_invalidates_previous(self, mock_send, auth_client, user):
        # Send OTP twice
        auth_client.post("/api/auth/send-otp/")
        auth_client.post("/api/auth/send-otp/")
        # Only the latest should be unused
        unused = EmailVerification.objects.filter(user=user, is_used=False)
        assert unused.count() == 1


@pytest.mark.django_db
class TestVerifyOtp:
    """Tests for POST /api/auth/verify-otp/"""

    def test_verify_otp_success(self, auth_client, user):
        # Create a valid OTP
        verification = EmailVerification.objects.create(
            user=user,
            otp_code="123456",
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        response = auth_client.post(
            "/api/auth/verify-otp/", {"otp_code": "123456"}
        )
        assert response.status_code == status.HTTP_200_OK
        verification.refresh_from_db()
        assert verification.is_used is True

    def test_verify_otp_wrong_code(self, auth_client, user):
        EmailVerification.objects.create(
            user=user,
            otp_code="123456",
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        response = auth_client.post(
            "/api/auth/verify-otp/", {"otp_code": "000000"}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_otp_expired(self, auth_client, user):
        EmailVerification.objects.create(
            user=user,
            otp_code="123456",
            expires_at=timezone.now() - timedelta(minutes=1),
        )
        response = auth_client.post(
            "/api/auth/verify-otp/", {"otp_code": "123456"}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_otp_already_used(self, auth_client, user):
        EmailVerification.objects.create(
            user=user,
            otp_code="123456",
            expires_at=timezone.now() + timedelta(minutes=5),
            is_used=True,
        )
        response = auth_client.post(
            "/api/auth/verify-otp/", {"otp_code": "123456"}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_otp_unauthenticated(self, api_client):
        response = api_client.post(
            "/api/auth/verify-otp/", {"otp_code": "123456"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestForgotPassword:
    """Tests for POST /api/auth/forgot-password/"""

    @patch("apps.email_verification.services._send_email")
    def test_forgot_password_success(self, mock_send, api_client, user):
        response = api_client.post(
            "/api/auth/forgot-password/", {"email": user.email}
        )
        assert response.status_code == status.HTTP_200_OK
        mock_send.assert_called_once()
        assert PasswordReset.objects.filter(email=user.email).exists()

    @patch("apps.email_verification.services._send_email")
    def test_forgot_password_nonexistent_email(self, mock_send, api_client):
        # Should still return success to prevent email enumeration
        response = api_client.post(
            "/api/auth/forgot-password/", {"email": "nobody@example.com"}
        )
        assert response.status_code == status.HTTP_200_OK
        mock_send.assert_not_called()

    def test_forgot_password_invalid_email(self, api_client):
        response = api_client.post(
            "/api/auth/forgot-password/", {"email": "not-an-email"}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestResetPassword:
    """Tests for POST /api/auth/reset-password/"""

    def test_reset_password_success(self, api_client, user):
        PasswordReset.objects.create(
            email=user.email,
            otp_code="123456",
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        response = api_client.post(
            "/api/auth/reset-password/",
            {
                "email": user.email,
                "otp_code": "123456",
                "new_password": "NewPass@123",
                "new_password_confirm": "NewPass@123",
            },
        )
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.check_password("NewPass@123")

    def test_reset_password_wrong_otp(self, api_client, user):
        PasswordReset.objects.create(
            email=user.email,
            otp_code="123456",
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        response = api_client.post(
            "/api/auth/reset-password/",
            {
                "email": user.email,
                "otp_code": "000000",
                "new_password": "NewPass@123",
                "new_password_confirm": "NewPass@123",
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_reset_password_expired_otp(self, api_client, user):
        PasswordReset.objects.create(
            email=user.email,
            otp_code="123456",
            expires_at=timezone.now() - timedelta(minutes=1),
        )
        response = api_client.post(
            "/api/auth/reset-password/",
            {
                "email": user.email,
                "otp_code": "123456",
                "new_password": "NewPass@123",
                "new_password_confirm": "NewPass@123",
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_reset_password_mismatch(self, api_client, user):
        PasswordReset.objects.create(
            email=user.email,
            otp_code="123456",
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        response = api_client.post(
            "/api/auth/reset-password/",
            {
                "email": user.email,
                "otp_code": "123456",
                "new_password": "NewPass@123",
                "new_password_confirm": "DifferentPass@123",
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_reset_password_weak_password(self, api_client, user):
        PasswordReset.objects.create(
            email=user.email,
            otp_code="123456",
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        response = api_client.post(
            "/api/auth/reset-password/",
            {
                "email": user.email,
                "otp_code": "123456",
                "new_password": "123",
                "new_password_confirm": "123",
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
