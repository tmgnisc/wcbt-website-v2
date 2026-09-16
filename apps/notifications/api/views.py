"""
Views for the Notifications API.
"""

import logging

from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.authentication.api.permissions import IsAdmin
from apps.common.responses import error_response, success_response

from apps.notifications.models import Notification
from apps.notifications.api.serializers import (
    BulkNotificationSerializer,
    NotificationCreateSerializer,
    NotificationDetailSerializer,
    NotificationListSerializer,
)

logger = logging.getLogger("apps")


class NotificationListCreateView(generics.ListCreateAPIView):
    """List all notifications or create a new notification."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return NotificationCreateSerializer
        return NotificationListSerializer

    def get_queryset(self):
        return Notification.objects.select_related("created_by").all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        with transaction.atomic():
            notification = Notification.objects.create(
                title=data["title"],
                message=data["message"],
                category=data.get("category", Notification.Category.GENERAL),
                priority=data.get("priority", Notification.Priority.NORMAL),
                status=data.get("status", Notification.Status.DRAFT),
                target_roles=data.get("target_roles", []),
                created_by=request.user,
            )

        logger.info("Notification created: %s", notification.title)

        return success_response(
            data=NotificationDetailSerializer(notification, context={"request": request}).data,
            message="Notification created successfully",
            status=status.HTTP_201_CREATED,
        )


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a notification."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Notification.objects.select_related("created_by").all()

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return NotificationCreateSerializer
        return NotificationDetailSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        with transaction.atomic():
            for field in ["title", "message", "category", "priority", "status", "target_roles"]:
                if field in data:
                    setattr(instance, field, data[field])
            instance.save()

        return success_response(
            data=NotificationDetailSerializer(instance, context={"request": request}).data,
            message="Notification updated successfully",
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = Notification.Status.ARCHIVED
        instance.save()
        logger.info("Notification archived: %s", instance.title)
        return success_response(message="Notification archived successfully")


class NotificationPublishView(generics.GenericAPIView):
    """Publish a draft notification."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Notification.objects.all()

    def patch(self, request, *args, **kwargs):
        notification = self.get_object()
        if notification.status == Notification.Status.PUBLISHED:
            return error_response(
                message="Notification is already published",
                status=status.HTTP_400_BAD_REQUEST,
            )
        notification.status = Notification.Status.PUBLISHED
        notification.save()
        return success_response(
            data=NotificationDetailSerializer(notification, context={"request": request}).data,
            message="Notification published successfully",
        )


class NotificationBulkActionView(generics.GenericAPIView):
    """Bulk operations on notifications."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, *args, **kwargs):
        serializer = BulkNotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        ids = data["ids"]
        action = data["action"]
        notifications = Notification.objects.filter(id__in=ids)

        with transaction.atomic():
            if action == "delete":
                count = notifications.update(status=Notification.Status.ARCHIVED)
                message = f"{count} notifications archived"
            elif action == "publish":
                count = notifications.update(status=Notification.Status.PUBLISHED)
                message = f"{count} notifications published"
            elif action == "archive":
                count = notifications.update(status=Notification.Status.ARCHIVED)
                message = f"{count} notifications archived"

        return success_response(
            data={"affected": count},
            message=message,
        )


class NotificationMarkReadView(generics.GenericAPIView):
    """Mark a notification as read."""

    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.all()

    def patch(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return success_response(message="Notification marked as read")
