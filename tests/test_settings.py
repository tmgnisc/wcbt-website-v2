"""
Tests for the College Settings API.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

from apps.collegesettings.models import CollegeInfo

User = get_user_model()


@pytest.mark.django_db
class TestCollegeInfoRetrieve:
    """Tests for GET /api/settings/"""

    def test_retrieve_default(self, admin_client):
        response = admin_client.get("/api/settings/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["college_name"] == "WhiteHouse College of Business & Technology"

    def test_retrieve_unauthenticated(self, api_client):
        response = api_client.get("/api/settings/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_staff_forbidden(self, auth_client):
        response = auth_client.get("/api/settings/")
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestCollegeInfoUpdate:
    """Tests for PUT/PATCH /api/settings/"""

    def test_patch_update(self, admin_client):
        response = admin_client.patch(
            "/api/settings/",
            {"college_name": "WCBT Updated"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        info = CollegeInfo.load()
        assert info.college_name == "WCBT Updated"

    def test_put_update(self, admin_client):
        response = admin_client.put(
            "/api/settings/",
            {
                "college_name": "WCBT Full Update",
                "college_code": "WCBT",
                "address": "Kathmandu, Nepal",
                "phone": "+977-1-4XXXXXX",
                "email": "info@wcbt.edu.np",
                "website": "https://wcbt.edu.np",
                "logo_url": "",
                "established_date": None,
                "motto": "Excellence in Education",
                "academic_year_start": 1,
                "max_students_per_program": 500,
                "enable_email_notifications": True,
                "enable_sms_notifications": False,
                "default_password": "ChangeMe@123",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        info = CollegeInfo.load()
        assert info.college_name == "WCBT Full Update"
        assert info.address == "Kathmandu, Nepal"

    def test_update_staff_forbidden(self, auth_client):
        response = auth_client.patch(
            "/api/settings/",
            {"college_name": "Hacked"},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_singleton_persists(self, admin_client):
        admin_client.patch(
            "/api/settings/",
            {"college_name": "First Update"},
            format="json",
        )
        admin_client.patch(
            "/api/settings/",
            {"college_name": "Second Update"},
            format="json",
        )
        assert CollegeInfo.objects.count() == 1
        info = CollegeInfo.load()
        assert info.college_name == "Second Update"
