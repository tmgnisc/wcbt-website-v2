"""
Shared pytest fixtures.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    """Return an unauthenticated API client."""
    return APIClient()


@pytest.fixture
def user(db):
    """Create and return a regular Staff user."""
    return User.objects.create_user(
        email="staff@example.com",
        first_name="John",
        last_name="Doe",
        password="StrongPass1!",
        role=User.Role.STAFF,
    )


@pytest.fixture
def superadmin(db):
    """Create and return a SuperAdmin user."""
    return User.objects.create_superuser(
        email="admin@example.com",
        first_name="Admin",
        last_name="User",
        password="StrongPass1!",
    )


@pytest.fixture
def auth_client(api_client, user):
    """Return an authenticated API client for a Staff user."""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def admin_client(api_client, superadmin):
    """Return an authenticated API client for a SuperAdmin user."""
    api_client.force_authenticate(user=superadmin)
    return api_client
