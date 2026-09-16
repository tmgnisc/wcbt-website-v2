"""
Tests for the Notifications API.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

from apps.notifications.models import Notification

User = get_user_model()


@pytest.fixture
def notification(db, superadmin):
    return Notification.objects.create(
        title="Test Notification",
        message="This is a test notification",
        category="General",
        priority="Normal",
        status="Draft",
        target_roles=["staff", "admin"],
        created_by=superadmin,
    )


@pytest.fixture
def sample_notification_data():
    return {
        "title": "New Announcement",
        "message": "Campus will be closed tomorrow",
        "category": "General",
        "priority": "Normal",
        "status": "Draft",
        "target_roles": ["staff"],
    }


@pytest.mark.django_db
class TestNotificationList:
    """Tests for GET /api/notifications/"""

    def test_list_empty(self, admin_client):
        response = admin_client.get("/api/notifications/")
        assert response.status_code == status.HTTP_200_OK

    def test_list_with_notifications(self, admin_client, notification):
        response = admin_client.get("/api/notifications/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_list_unauthenticated(self, api_client):
        response = api_client.get("/api/notifications/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_staff_user_forbidden(self, auth_client):
        response = auth_client.get("/api/notifications/")
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestNotificationCreate:
    """Tests for POST /api/notifications/"""

    def test_create_success(self, admin_client, sample_notification_data):
        response = admin_client.post(
            "/api/notifications/", sample_notification_data, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert Notification.objects.count() == 1

    def test_create_missing_fields(self, admin_client):
        response = admin_client.post("/api/notifications/", {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_sets_created_by(self, admin_client, sample_notification_data):
        admin_client.post("/api/notifications/", sample_notification_data, format="json")
        notification = Notification.objects.first()
        assert notification.created_by is not None


@pytest.mark.django_db
class TestNotificationDetail:
    """Tests for GET /api/notifications/{id}/"""

    def test_retrieve_success(self, admin_client, notification):
        response = admin_client.get(f"/api/notifications/{notification.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Test Notification"

    def test_retrieve_not_found(self, admin_client):
        import uuid
        response = admin_client.get(f"/api/notifications/{uuid.uuid4()}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_retrieve_staff_user_forbidden(self, auth_client, notification):
        response = auth_client.get(f"/api/notifications/{notification.id}/")
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestNotificationUpdate:
    """Tests for PATCH /api/notifications/{id}/"""

    def test_update_success(self, admin_client, notification):
        response = admin_client.patch(
            f"/api/notifications/{notification.id}/",
            {"title": "Updated Title"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.title == "Updated Title"


@pytest.mark.django_db
class TestNotificationDelete:
    """Tests for DELETE /api/notifications/{id}/"""

    def test_delete_archives(self, admin_client, notification):
        response = admin_client.delete(f"/api/notifications/{notification.id}/")
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.status == "Archived"


@pytest.mark.django_db
class TestNotificationPublish:
    """Tests for PATCH /api/notifications/{id}/publish/"""

    def test_publish_draft(self, admin_client, notification):
        response = admin_client.patch(f"/api/notifications/{notification.id}/publish/")
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.status == "Published"

    def test_publish_already_published(self, admin_client, notification):
        notification.status = "Published"
        notification.save()
        response = admin_client.patch(f"/api/notifications/{notification.id}/publish/")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestNotificationBulkAction:
    """Tests for POST /api/notifications/bulk-action/"""

    def test_bulk_publish(self, admin_client, notification):
        response = admin_client.post(
            "/api/notifications/bulk-action/",
            {"ids": [str(notification.id)], "action": "publish"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.status == "Published"

    def test_bulk_archive(self, admin_client, notification):
        response = admin_client.post(
            "/api/notifications/bulk-action/",
            {"ids": [str(notification.id)], "action": "archive"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.status == "Archived"

    def test_bulk_delete(self, admin_client, notification):
        response = admin_client.post(
            "/api/notifications/bulk-action/",
            {"ids": [str(notification.id)], "action": "delete"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.status == "Archived"


@pytest.mark.django_db
class TestNotificationMarkRead:
    """Tests for PATCH /api/notifications/{id}/read/"""

    def test_mark_read(self, auth_client, notification):
        response = auth_client.patch(f"/api/notifications/{notification.id}/read/")
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.is_read is True

    def test_mark_read_unauthenticated(self, api_client, notification):
        response = api_client.patch(f"/api/notifications/{notification.id}/read/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
