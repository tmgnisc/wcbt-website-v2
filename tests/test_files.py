"""
Tests for the File Upload API.
"""

import io

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status

from apps.files.models import UploadedFile

User = get_user_model()


@pytest.fixture
def sample_file():
    return SimpleUploadedFile(
        "test_document.pdf",
        b"PDF content for testing",
        content_type="application/pdf",
    )


@pytest.fixture
def uploaded_file(db, superadmin, sample_file):
    return UploadedFile.objects.create(
        file=sample_file,
        original_name="test_document.pdf",
        file_size=22,
        mime_type="application/pdf",
        category="general",
        uploaded_by=superadmin,
    )


@pytest.mark.django_db
class TestFileUpload:
    """Tests for POST /api/files/upload/"""

    def test_upload_success(self, admin_client, sample_file):
        response = admin_client.post(
            "/api/files/upload/",
            {"file": sample_file, "category": "staff"},
            format="multipart",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert UploadedFile.objects.count() == 1

    def test_upload_no_file(self, admin_client):
        response = admin_client.post(
            "/api/files/upload/",
            {},
            format="multipart",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_upload_unauthenticated(self, api_client, sample_file):
        response = api_client.post(
            "/api/files/upload/",
            {"file": sample_file},
            format="multipart",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_upload_staff_forbidden(self, auth_client, sample_file):
        response = auth_client.post(
            "/api/files/upload/",
            {"file": sample_file},
            format="multipart",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_upload_sets_metadata(self, admin_client, sample_file):
        admin_client.post(
            "/api/files/upload/",
            {"file": sample_file, "category": "admission"},
            format="multipart",
        )
        uploaded = UploadedFile.objects.first()
        assert uploaded.original_name == "test_document.pdf"
        assert uploaded.category == "admission"
        assert uploaded.uploaded_by is not None


@pytest.mark.django_db
class TestFileList:
    """Tests for GET /api/files/"""

    def test_list_empty(self, admin_client):
        response = admin_client.get("/api/files/")
        assert response.status_code == status.HTTP_200_OK

    def test_list_with_files(self, admin_client, uploaded_file):
        response = admin_client.get("/api/files/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_list_filter_by_category(self, admin_client, uploaded_file):
        response = admin_client.get("/api/files/?category=staff")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

        response = admin_client.get("/api/files/?category=general")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_list_unauthenticated(self, api_client):
        response = api_client.get("/api/files/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_staff_forbidden(self, auth_client):
        response = auth_client.get("/api/files/")
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestFileDelete:
    """Tests for DELETE /api/files/{id}/"""

    def test_delete_success(self, admin_client, uploaded_file):
        response = admin_client.delete(f"/api/files/{uploaded_file.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert UploadedFile.objects.count() == 0

    def test_delete_not_found(self, admin_client):
        import uuid
        response = admin_client.delete(f"/api/files/{uuid.uuid4()}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_staff_forbidden(self, auth_client, uploaded_file):
        response = auth_client.delete(f"/api/files/{uploaded_file.id}/")
        assert response.status_code == status.HTTP_403_FORBIDDEN
