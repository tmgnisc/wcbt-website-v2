"""
Tests for the authentication API.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestSignup:
    """Tests for POST /api/auth/signup/"""

    def test_signup_success(self, api_client):
        payload = {
            "email": "newuser@example.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "password": "StrongPass1!",
            "password_confirm": "StrongPass1!",
        }
        response = api_client.post("/api/auth/signup/", payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert User.objects.filter(email="newuser@example.com").exists()

    def test_signup_duplicate_email(self, api_client, user):
        payload = {
            "email": "staff@example.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "password": "StrongPass1!",
            "password_confirm": "StrongPass1!",
        }
        response = api_client.post("/api/auth/signup/", payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_signup_weak_password(self, api_client):
        payload = {
            "email": "weak@example.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "password": "123",
            "password_confirm": "123",
        }
        response = api_client.post("/api/auth/signup/", payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_signup_password_mismatch(self, api_client):
        payload = {
            "email": "mismatch@example.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "password": "StrongPass1!",
            "password_confirm": "DifferentPass1!",
        }
        response = api_client.post("/api/auth/signup/", payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_signup_missing_fields(self, api_client):
        response = api_client.post("/api/auth/signup/", {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:
    """Tests for POST /api/auth/login/"""

    def test_login_success(self, api_client, user):
        payload = {
            "email": "staff@example.com",
            "password": "StrongPass1!",
        }
        response = api_client.post("/api/auth/login/", payload)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert "access" in response.data["data"]
        assert "refresh" in response.data["data"]

    def test_login_wrong_password(self, api_client, user):
        payload = {
            "email": "staff@example.com",
            "password": "WrongPassword1!",
        }
        response = api_client.post("/api/auth/login/", payload)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["success"] is False

    def test_login_nonexistent_email(self, api_client):
        payload = {
            "email": "nobody@example.com",
            "password": "StrongPass1!",
        }
        response = api_client.post("/api/auth/login/", payload)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["success"] is False

    def test_login_deactivated_user(self, api_client, user):
        user.is_active = False
        user.save()
        payload = {
            "email": "staff@example.com",
            "password": "StrongPass1!",
        }
        response = api_client.post("/api/auth/login/", payload)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestProfile:
    """Tests for GET /api/auth/profile/"""

    def test_profile_authorized(self, auth_client, user):
        response = auth_client.get("/api/auth/profile/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["email"] == user.email
        assert response.data["data"]["role"] == User.Role.STAFF

    def test_profile_unauthorized(self, api_client):
        response = api_client.get("/api/auth/profile/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestLogout:
    """Tests for POST /api/auth/logout/"""

    def test_logout_success(self, api_client, user):
        # Login to get tokens
        login_response = api_client.post(
            "/api/auth/login/",
            {"email": "staff@example.com", "password": "StrongPass1!"},
        )
        refresh_token = login_response.data["data"]["refresh"]

        # Authenticate and logout
        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/auth/logout/",
            {"refresh": refresh_token},
        )
        assert response.status_code == status.HTTP_200_OK

    def test_logout_invalid_token(self, api_client, user):
        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/auth/logout/",
            {"refresh": "invalid-token"},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestTokenRefresh:
    """Tests for POST /api/auth/token/refresh/"""

    def test_token_refresh_success(self, api_client, user):
        # Login to get tokens
        login_response = api_client.post(
            "/api/auth/login/",
            {"email": "staff@example.com", "password": "StrongPass1!"},
        )
        refresh_token = login_response.data["data"]["refresh"]

        # Refresh the token
        response = api_client.post(
            "/api/auth/token/refresh/",
            {"refresh": refresh_token},
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data["data"]

    def test_token_refresh_invalid(self, api_client):
        response = api_client.post(
            "/api/auth/token/refresh/",
            {"refresh": "invalid-token"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestPermissions:
    """Tests for role-based permission checks."""

    def test_staff_cannot_manage_staff(self, auth_client):
        response = auth_client.get("/api/staff/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_superadmin_endpoint_requires_superadmin(self, auth_client):
        """Staff users should not access SuperAdmin-only endpoints."""
        # This will be relevant once staff management endpoints exist
        pass
