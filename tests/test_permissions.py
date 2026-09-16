"""
Tests for the Permission classes.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.api.permissions import (
    HasPortalPermission,
    IsAdmin,
    IsStaffUser,
    IsSuperAdmin,
    PORTAL_PERMISSIONS,
)

User = get_user_model()


@pytest.fixture
def staff_user(db):
    return User.objects.create_user(
        email="staff@test.com",
        first_name="Staff",
        last_name="User",
        password="StrongPass1!",
        role="staff",
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email="admin@test.com",
        first_name="Admin",
        last_name="User",
        password="StrongPass1!",
        role="admin",
    )


@pytest.fixture
def superadmin_user(db):
    return User.objects.create_superuser(
        email="superadmin@test.com",
        first_name="Super",
        last_name="Admin",
        password="StrongPass1!",
    )


@pytest.mark.django_db
class TestIsStaffUser:
    """Tests for IsStaffUser permission."""

    def test_staff_allowed(self, staff_user):
        client = APIClient()
        client.force_authenticate(user=staff_user)
        response = client.get("/api/auth/me/")
        assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated_denied(self):
        client = APIClient()
        response = client.get("/api/auth/me/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestIsAdmin:
    """Tests for IsAdmin permission."""

    def test_admin_allowed(self, admin_client):
        response = admin_client.get("/api/staff/")
        assert response.status_code == status.HTTP_200_OK

    def test_staff_denied(self, auth_client):
        response = auth_client.get("/api/staff/")
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestIsSuperAdmin:
    """Tests for IsSuperAdmin permission."""

    def test_superadmin_allowed(self, admin_client):
        response = admin_client.get("/api/settings/")
        assert response.status_code == status.HTTP_200_OK

    def test_admin_denied(self, api_client, admin_user):
        client = APIClient()
        client.force_authenticate(user=admin_user)
        response = client.get("/api/settings/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_staff_denied(self, auth_client):
        response = auth_client.get("/api/settings/")
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestHasPortalPermission:
    """Tests for HasPortalPermission."""

    def test_portal_permission_mapping_exists(self):
        assert ("staff", "read") in PORTAL_PERMISSIONS
        assert ("staff", "write") in PORTAL_PERMISSIONS
        assert ("settings", "read") in PORTAL_PERMISSIONS
        assert ("settings", "write") in PORTAL_PERMISSIONS

    def test_staff_can_read_staff_portal(self, staff_user):
        perm = HasPortalPermission()
        request = type("Request", (), {"user": staff_user, "method": "GET"})()
        view = type("View", (), {"portal": "staff"})()
        assert perm.has_permission(request, view) is True

    def test_staff_cannot_write_staff_portal(self, staff_user):
        perm = HasPortalPermission()
        request = type("Request", (), {"user": staff_user, "method": "POST"})()
        view = type("View", (), {"portal": "staff"})()
        assert perm.has_permission(request, view) is False

    def test_admin_can_write_staff_portal(self, admin_user):
        perm = HasPortalPermission()
        request = type("Request", (), {"user": admin_user, "method": "POST"})()
        view = type("View", (), {"portal": "staff"})()
        assert perm.has_permission(request, view) is True

    def test_superadmin_can_write_settings_portal(self, superadmin_user):
        perm = HasPortalPermission()
        request = type("Request", (), {"user": superadmin_user, "method": "POST"})()
        view = type("View", (), {"portal": "settings"})()
        assert perm.has_permission(request, view) is True

    def test_admin_cannot_write_settings_portal(self, admin_user):
        perm = HasPortalPermission()
        request = type("Request", (), {"user": admin_user, "method": "POST"})()
        view = type("View", (), {"portal": "settings"})()
        assert perm.has_permission(request, view) is False

    def test_no_portal_allows_all(self, staff_user):
        perm = HasPortalPermission()
        request = type("Request", (), {"user": staff_user, "method": "POST"})()
        view = type("View", (), {})()
        assert perm.has_permission(request, view) is True

    def test_unauthenticated_denied(self):
        perm = HasPortalPermission()
        request = type("Request", (), {"user": None, "method": "GET"})()
        view = type("View", (), {"portal": "staff"})()
        assert perm.has_permission(request, view) is False
