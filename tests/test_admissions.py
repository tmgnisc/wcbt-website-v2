"""
Tests for the Admissions API.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

from apps.admissions.models import Admission, AdmissionActivity
from apps.programs.models import Program

User = get_user_model()


@pytest.fixture
def program(db):
    return Program.objects.create(
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


@pytest.fixture
def admission(db, program):
    return Admission.objects.create(
        first_name="Sushmita",
        last_name="Karki",
        email="sushmita@example.com",
        phone="+9779842116677",
        program=program,
        stage="Applied",
    )


@pytest.fixture
def sample_admission_data(program):
    return {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone": "+9779842116677",
        "program": str(program.id),
    }


@pytest.mark.django_db
class TestAdmissionList:
    """Tests for GET /api/admissions/"""

    def test_list_empty(self, admin_client):
        response = admin_client.get("/api/admissions/")
        assert response.status_code == status.HTTP_200_OK

    def test_list_with_admissions(self, admin_client, admission):
        response = admin_client.get("/api/admissions/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_list_unauthenticated(self, api_client):
        response = api_client.get("/api/admissions/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_staff_user_forbidden(self, auth_client):
        response = auth_client.get("/api/admissions/")
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestAdmissionCreate:
    """Tests for POST /api/admissions/"""

    def test_create_success(self, admin_client, sample_admission_data):
        response = admin_client.post(
            "/api/admissions/", sample_admission_data, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert Admission.objects.count() == 1
        assert AdmissionActivity.objects.count() == 1

    def test_create_duplicate_email(self, admin_client, admission, sample_admission_data):
        sample_admission_data["email"] = "sushmita@example.com"
        response = admin_client.post(
            "/api/admissions/", sample_admission_data, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_missing_fields(self, admin_client):
        response = admin_client.post("/api/admissions/", {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_generates_applied_date(self, admin_client, sample_admission_data):
        admin_client.post("/api/admissions/", sample_admission_data, format="json")
        admission = Admission.objects.first()
        assert admission.applied_date is not None


@pytest.mark.django_db
class TestAdmissionDetail:
    """Tests for GET /api/admissions/{id}/"""

    def test_retrieve_success(self, admin_client, admission):
        response = admin_client.get(f"/api/admissions/{admission.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["first_name"] == "Sushmita"

    def test_retrieve_not_found(self, admin_client):
        import uuid
        response = admin_client.get(f"/api/admissions/{uuid.uuid4()}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_retrieve_staff_user_forbidden(self, auth_client, admission):
        response = auth_client.get(f"/api/admissions/{admission.id}/")
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestAdmissionUpdate:
    """Tests for PATCH /api/admissions/{id}/"""

    def test_update_success(self, admin_client, admission):
        response = admin_client.patch(
            f"/api/admissions/{admission.id}/",
            {"first_name": "Sushmita Updated"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        admission.refresh_from_db()
        assert admission.first_name == "Sushmita Updated"

    def test_update_creates_activity(self, admin_client, admission):
        admin_client.patch(
            f"/api/admissions/{admission.id}/",
            {"first_name": "Updated"},
            format="json",
        )
        assert AdmissionActivity.objects.filter(admission=admission).count() >= 1


@pytest.mark.django_db
class TestAdmissionDelete:
    """Tests for DELETE /api/admissions/{id}/"""

    def test_delete_deactivates(self, admin_client, admission):
        response = admin_client.delete(f"/api/admissions/{admission.id}/")
        assert response.status_code == status.HTTP_200_OK
        admission.refresh_from_db()
        assert admission.status == "Inactive"


@pytest.mark.django_db
class TestAdmissionStatus:
    """Tests for PATCH /api/admissions/{id}/status/"""

    def test_update_stage(self, admin_client, admission):
        response = admin_client.patch(
            f"/api/admissions/{admission.id}/status/",
            {"stage": "Document Verification"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        admission.refresh_from_db()
        assert admission.stage == "Document Verification"

    def test_update_status(self, admin_client, admission):
        response = admin_client.patch(
            f"/api/admissions/{admission.id}/status/",
            {"status": "Inactive"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        admission.refresh_from_db()
        assert admission.status == "Inactive"

    def test_update_creates_activity(self, admin_client, admission):
        admin_client.patch(
            f"/api/admissions/{admission.id}/status/",
            {"stage": "Enrolled"},
            format="json",
        )
        assert AdmissionActivity.objects.filter(admission=admission).count() >= 1


@pytest.mark.django_db
class TestAdmissionBulkAction:
    """Tests for POST /api/admissions/bulk-action/"""

    def test_bulk_delete(self, admin_client, admission):
        response = admin_client.post(
            "/api/admissions/bulk-action/",
            {"ids": [str(admission.id)], "action": "delete"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        admission.refresh_from_db()
        assert admission.status == "Inactive"

    def test_bulk_stage_update(self, admin_client, admission):
        response = admin_client.post(
            "/api/admissions/bulk-action/",
            {"ids": [str(admission.id)], "action": "stage", "stage": "Enrolled"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        admission.refresh_from_db()
        assert admission.stage == "Enrolled"

    def test_bulk_status_update(self, admin_client, admission):
        response = admin_client.post(
            "/api/admissions/bulk-action/",
            {"ids": [str(admission.id)], "action": "status", "status": "Inactive"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        admission.refresh_from_db()
        assert admission.status == "Inactive"

    def test_bulk_missing_stage(self, admin_client, admission):
        response = admin_client.post(
            "/api/admissions/bulk-action/",
            {"ids": [str(admission.id)], "action": "stage"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestAdmissionTrend:
    """Tests for GET /api/admissions/trend/"""

    def test_trend_empty(self, admin_client):
        response = admin_client.get("/api/admissions/trend/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["total"] == 0

    def test_trend_with_data(self, admin_client, admission):
        response = admin_client.get("/api/admissions/trend/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["total"] == 1


@pytest.mark.django_db
class TestAdmissionConvert:
    """Tests for POST /api/admissions/{id}/convert/"""

    def test_convert_enrolled(self, admin_client, admission):
        admission.stage = "Enrolled"
        admission.save()
        response = admin_client.post(f"/api/admissions/{admission.id}/convert/")
        assert response.status_code == status.HTTP_200_OK

    def test_convert_not_enrolled(self, admin_client, admission):
        response = admin_client.post(f"/api/admissions/{admission.id}/convert/")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_convert_creates_activity(self, admin_client, admission):
        admission.stage = "Enrolled"
        admission.save()
        admin_client.post(f"/api/admissions/{admission.id}/convert/")
        assert AdmissionActivity.objects.filter(
            admission=admission, action="Converted to student"
        ).exists()
