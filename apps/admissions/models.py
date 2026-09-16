"""
Models for the Admissions app.
"""

import uuid

from django.db import models


class Admission(models.Model):
    """Admission application model."""

    class Stage(models.TextChoices):
        APPLIED = "Applied", "Applied"
        DOCUMENT_VERIFICATION = "Document Verification", "Document Verification"
        TEST_INTERVIEW = "Test/Interview", "Test/Interview"
        RESULT = "Result", "Result"
        ENROLLED = "Enrolled", "Enrolled"
        REJECTED = "Rejected", "Rejected"

    class Status(models.TextChoices):
        ACTIVE = "Active", "Active"
        INACTIVE = "Inactive", "Inactive"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, default="")
    program = models.ForeignKey(
        "programs.Program",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admissions",
    )
    stage = models.CharField(
        max_length=30,
        choices=Stage.choices,
        default=Stage.APPLIED,
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    applied_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True, default="")
    documents = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.stage}"


class AdmissionActivity(models.Model):
    """Activity log for admission changes."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admission = models.ForeignKey(
        Admission,
        on_delete=models.CASCADE,
        related_name="activity",
    )
    action = models.CharField(max_length=255)
    actor = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.action} - {self.admission.first_name} {self.admission.last_name}"
