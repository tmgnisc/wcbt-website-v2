"""
Tests for the Staff API.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

from apps.staff.models import StaffActivity, StaffMember

User = get_user_model()


@pytest.fixture
def staff_user(db):
    return User.objects.create_user(
        email="staffuser@example.com",
        first_name="Jane",
        last_name="Smith",
        password="StrongPass1!",
        role="staff",
    )


@pytest.fixture
def staff_member(db, staff_user):
    return StaffMember.objects.create(
        staff_id="WCBT-S-0001",
        user=staff_user,
        gender="Female",
        department="Information Technology",
        designation="Lecturer",
        phone="+9779842116677",
    )


@pytest.mark.django_db
class TestStaffList:
    """Tests for GET /api/staff/"""

    def test_list_empty(self, admin_client):
        response = admin_client.get("/api/staff/")
        assert response.status_code == status.HTTP_200_OK

    def test_list_with_staff(self, admin_client, staff_member):
        response = admin_client.get("/api/staff/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_list_unauthenticated(self, api_client):
        response = api_client.get("/api/staff/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_staff_user_forbidden(self, auth_client):
        response = auth_client.get("/api/staff/")
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestStaffCreate:
    """Tests for POST /api/staff/"""

    def test_create_success(self, admin_client):
        payload = {
            "first_name": "Sushmita",
            "last_name": "Karki",
            "email": "sushmita.karki@wcbt.edu.np",
            "gender": "Female",
            "department": "Information Technology",
            "designation": "Head of Department",
        }
        response = admin_client.post("/api/staff/", payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert StaffMember.objects.count() == 1
        assert StaffActivity.objects.count() == 1

    def test_create_duplicate_email(self, admin_client, staff_member):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "staffuser@example.com",
        }
        response = admin_client.post("/api/staff/", payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_missing_fields(self, admin_client):
        response = admin_client.post("/api/staff/", {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_generates_staff_id(self, admin_client):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
        }
        admin_client.post("/api/staff/", payload, format="json")
        staff = StaffMember.objects.first()
        assert staff.staff_id == "WCBT-S-0001"


@pytest.mark.django_db
class TestStaffDetail:
    """Tests for GET /api/staff/{id}/"""

    def test_retrieve_success(self, admin_client, staff_member):
        response = admin_client.get(f"/api/staff/{staff_member.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["department"] == "Information Technology"

    def test_retrieve_not_found(self, admin_client):
        import uuid
        response = admin_client.get(f"/api/staff/{uuid.uuid4()}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_retrieve_staff_user_forbidden(self, auth_client, staff_member):
        response = auth_client.get(f"/api/staff/{staff_member.id}/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_salary_hidden_from_non_superadmin(self, api_client, staff_member):
        """Salary should be hidden from non-superadmin users."""
        admin_user = User.objects.create_user(
            email="admin_only@example.com",
            first_name="Admin",
            last_name="Only",
            password="StrongPass1!",
            role="admin",
        )
        api_client.force_authenticate(user=admin_user)
        staff_member.salary = 132000
        staff_member.save()
        response = api_client.get(f"/api/staff/{staff_member.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert "salary" not in response.data

    def test_salary_visible_to_superadmin(self, admin_client, staff_member):
        staff_member.salary = 132000
        staff_member.save()
        response = admin_client.get(f"/api/staff/{staff_member.id}/")
        assert response.data.get("salary") == 132000


@pytest.mark.django_db
class TestStaffUpdate:
    """Tests for PATCH /api/staff/{id}/"""

    def test_update_success(self, admin_client, staff_member):
        response = admin_client.patch(
            f"/api/staff/{staff_member.id}/",
            {"designation": "Senior Lecturer"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        staff_member.refresh_from_db()
        assert staff_member.designation == "Senior Lecturer"

    def test_update_creates_activity(self, admin_client, staff_member):
        admin_client.patch(
            f"/api/staff/{staff_member.id}/",
            {"designation": "Senior Lecturer"},
            format="json",
        )
        assert StaffActivity.objects.filter(staff=staff_member).count() >= 1


@pytest.mark.django_db
class TestStaffDelete:
    """Tests for DELETE /api/staff/{id}/"""

    def test_delete_deactivates(self, admin_client, staff_member):
        response = admin_client.delete(f"/api/staff/{staff_member.id}/")
        assert response.status_code == status.HTTP_200_OK
        staff_member.refresh_from_db()
        assert staff_member.status == "Inactive"
        assert staff_member.user.is_active is False


@pytest.mark.django_db
class TestStaffToggleStatus:
    """Tests for PATCH /api/staff/{id}/toggle-status/"""

    def test_toggle_disable(self, admin_client, staff_member):
        response = admin_client.patch(f"/api/staff/{staff_member.id}/toggle-status/")
        assert response.status_code == status.HTTP_200_OK
        staff_member.refresh_from_db()
        assert staff_member.login_enabled is False

    def test_toggle_enable(self, admin_client, staff_member):
        staff_member.login_enabled = False
        staff_member.save()
        response = admin_client.patch(f"/api/staff/{staff_member.id}/toggle-status/")
        assert response.status_code == status.HTTP_200_OK
        staff_member.refresh_from_db()
        assert staff_member.login_enabled is True
