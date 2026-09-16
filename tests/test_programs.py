"""
Tests for the Programs API.
"""

import pytest
from rest_framework import status

from apps.programs.models import Program

PROGRAM_DATA = {
    "code": "BIT",
    "name": "Bachelor of Information Technology",
    "level": "Bachelor",
    "department": "Information Technology",
    "affiliation": "Kathmandu University",
    "duration_years": 4,
    "semesters": 8,
    "seats": 48,
    "fee_per_year": 185000,
    "coordinator": "Sushmita Karki",
    "status": "Active",
    "description": "Software engineering, networking and data management.",
}


@pytest.fixture
def program(db):
    return Program.objects.create(**PROGRAM_DATA)


@pytest.mark.django_db
class TestProgramList:
    """Tests for GET /api/programs/"""

    def test_list_empty(self, auth_client):
        response = auth_client.get("/api/programs/")
        assert response.status_code == status.HTTP_200_OK

    def test_list_with_programs(self, auth_client, program):
        response = auth_client.get("/api/programs/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_list_unauthenticated(self, api_client):
        response = api_client.get("/api/programs/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestProgramCreate:
    """Tests for POST /api/programs/"""

    def test_create_success(self, auth_client):
        response = auth_client.post("/api/programs/", PROGRAM_DATA, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert Program.objects.count() == 1

    def test_create_duplicate_code(self, auth_client, program):
        response = auth_client.post("/api/programs/", PROGRAM_DATA, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "code" in response.data["errors"]

    def test_create_missing_fields(self, auth_client):
        response = auth_client.post("/api/programs/", {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_unauthenticated(self, api_client):
        response = api_client.post("/api/programs/", PROGRAM_DATA, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestProgramDetail:
    """Tests for GET /api/programs/{id}/"""

    def test_retrieve_success(self, auth_client, program):
        response = auth_client.get(f"/api/programs/{program.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["code"] == "BIT"

    def test_retrieve_not_found(self, auth_client):
        import uuid
        response = auth_client.get(f"/api/programs/{uuid.uuid4()}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestProgramUpdate:
    """Tests for PATCH /api/programs/{id}/"""

    def test_update_success(self, auth_client, program):
        response = auth_client.patch(
            f"/api/programs/{program.id}/",
            {"seats": 60},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["seats"] == 60

    def test_update_duplicate_code(self, auth_client, program):
        Program.objects.create(
            code="MBA",
            name="Master of Business Administration",
            level="Master",
            department="Business",
            affiliation="Kathmandu University",
            duration_years=2,
            semesters=4,
            seats=40,
            fee_per_year=250000,
            coordinator="Test Coordinator",
        )
        response = auth_client.patch(
            f"/api/programs/{program.id}/",
            {"code": "MBA"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestProgramDelete:
    """Tests for DELETE /api/programs/{id}/"""

    def test_delete_success(self, auth_client, program):
        response = auth_client.delete(f"/api/programs/{program.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert Program.objects.count() == 0

    def test_delete_not_found(self, auth_client):
        import uuid
        response = auth_client.delete(f"/api/programs/{uuid.uuid4()}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND
