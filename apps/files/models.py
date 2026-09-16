"""
Models for the File Upload app.
"""

import uuid

from django.db import models


class UploadedFile(models.Model):
    """Model for tracking uploaded files."""

    class Category(models.TextChoices):
        STAFF = "staff", "Staff"
        ADMISSION = "admission", "Admission"
        PROGRAM = "program", "Program"
        NOTIFICATION = "notification", "Notification"
        GENERAL = "general", "General"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to="uploads/%Y/%m/")
    original_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)
    mime_type = models.CharField(max_length=128, blank=True, default="")
    category = models.CharField(
        max_length=16,
        choices=Category.choices,
        default=Category.GENERAL,
    )
    uploaded_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_files",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.original_name
