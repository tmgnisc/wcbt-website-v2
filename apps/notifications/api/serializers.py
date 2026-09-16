"""
Serializers for the Notifications API.
"""

from rest_framework import serializers

from apps.notifications.models import Notification


class NotificationListSerializer(serializers.ModelSerializer):
    """Serializer for notification list."""

    created_by_name = serializers.CharField(
        source="created_by.full_name", read_only=True, default=""
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "category",
            "priority",
            "status",
            "target_roles",
            "is_read",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class NotificationDetailSerializer(serializers.ModelSerializer):
    """Serializer for notification detail."""

    created_by_name = serializers.CharField(
        source="created_by.full_name", read_only=True, default=""
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "category",
            "priority",
            "status",
            "target_roles",
            "is_read",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class NotificationCreateSerializer(serializers.Serializer):
    """Serializer for creating/updating a notification."""

    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
    category = serializers.ChoiceField(
        choices=Notification.Category.choices, default=Notification.Category.GENERAL
    )
    priority = serializers.ChoiceField(
        choices=Notification.Priority.choices, default=Notification.Priority.NORMAL
    )
    status = serializers.ChoiceField(
        choices=Notification.Status.choices, default=Notification.Status.DRAFT
    )
    target_roles = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )


class BulkNotificationSerializer(serializers.Serializer):
    """Serializer for bulk notification actions."""

    ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)
    action = serializers.ChoiceField(choices=["publish", "archive", "delete"])
