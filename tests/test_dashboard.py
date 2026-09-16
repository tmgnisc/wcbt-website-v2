"""
Tests for the Dashboard API.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

from apps.admissions.models import Admission
from apps.notifications.models import Notification
from apps.programs.models import Program
from apps.staff.models import StaffMember

User = get_user_model()


@pytest.fixture
def sample_data(db, superadmin):
    """Create sample data for dashboard stats."""
    # Program
    program = Program.objects.create(
        name="Bachelor of Computer Application",
        code="BCA",
        level="Bachelor",
        department="Computing",
        affiliation="Tribhuvan University",
        duration_years=4,
        semesters=8,
        seats=60,
        fee_per_year=350000,
        coordinator="Dr. Ram Sharma",
        status="Active",
    )

    # Staff
    user = User.objects.create_user(
        email="staff@example.com",
        first_name="John",
        last_name="Doe",
        password="StrongPass1!",
        role="staff",
    )
    StaffMember.objects.create(
        staff_id="WCBT-S-0001",
        user=user,
        gender="Male",
        department="Computing",
        designation="Lecturer",
    )

    # Admission
    Admission.objects.create(
        first_name="Jane",
        last_name="Smith",
        email="jane@example.com",
        program=program,
        stage="Applied",
    )

    # Notification
    Notification.objects.create(
        title="Test",
        message="Test notification",
        created_by=superadmin,
    )


@pytest.mark.django_db
class TestDashboardSummary:
    """Tests for GET /api/dashboard/"""

    def test_summary_empty(self, admin_client):
        response = admin_client.get("/api/dashboard/")
        assert response.status_code == status.HTTP_200_OK
        data = response.data["data"]
        assert data["staff"]["total"] == 0
        assert data["programs"]["total"] == 0
        assert data["admissions"]["total"] == 0

    def test_summary_with_data(self, admin_client, sample_data):
        response = admin_client.get("/api/dashboard/")
        assert response.status_code == status.HTTP_200_OK
        data = response.data["data"]
        assert data["staff"]["total"] == 1
        assert data["staff"]["active"] == 1
        assert data["programs"]["total"] == 1
        assert data["admissions"]["total"] == 1
        assert data["notifications"]["total"] == 1

    def test_dashboard_unauthenticated(self, api_client):
        response = api_client.get("/api/dashboard/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_dashboard_staff_forbidden(self, auth_client):
        response = auth_client.get("/api/dashboard/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_summary_sections(self, admin_client):
        response = admin_client.get("/api/dashboard/")
        data = response.data["data"]
        assert "staff" in data
        assert "programs" in data
        assert "admissions" in data
        assert "notifications" in data
        assert "files" in data
