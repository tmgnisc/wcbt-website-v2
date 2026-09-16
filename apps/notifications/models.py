"""
Models for the Notifications app.
"""

import uuid

from django.db import models


class Notification(models.Model):
    """Notification model."""

    class Category(models.TextChoices):
        GENERAL = "General", "General"
        ACADEMIC = "Academic", "Academic"
        ADMISSION = "Admission", "Admission"
        URGENT = "Urgent", "Urgent"

    class Priority(models.TextChoices):
        NORMAL = "Normal", "Normal"
        HIGH = "High", "High"
        URGENT = "Urgent", "Urgent"

    class Status(models.TextChoices):
        DRAFT = "Draft", "Draft"
        PUBLISHED = "Published", "Published"
        ARCHIVED = "Archived", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    message = models.TextField()
    category = models.CharField(
        max_length=16,
        choices=Category.choices,
        default=Category.GENERAL,
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.NORMAL,
    )
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    target_roles = models.JSONField(default=list, blank=True)
    is_read = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_notifications",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
