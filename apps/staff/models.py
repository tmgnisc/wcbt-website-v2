"""
Staff models.
"""

import uuid

from django.conf import settings
from django.db import models


class StaffMember(models.Model):
    """Staff member profile linked to a User account."""

    class Gender(models.TextChoices):
        MALE = "Male", "Male"
        FEMALE = "Female", "Female"
        OTHER = "Other", "Other"

    class EmploymentType(models.TextChoices):
        FULL_TIME = "Full-time", "Full-time"
        PART_TIME = "Part-time", "Part-time"
        VISITING = "Visiting", "Visiting"

    class Status(models.TextChoices):
        ACTIVE = "Active", "Active"
        INACTIVE = "Inactive", "Inactive"
        ON_LEAVE = "On Leave", "On Leave"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff_id = models.CharField(max_length=16, unique=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="staff_profile",
    )
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True, default="")
    date_of_birth = models.DateField(null=True, blank=True)
    citizenship_no = models.CharField(max_length=32, blank=True, default="")
    address = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    photo_url = models.URLField(max_length=500, blank=True, null=True)
    department = models.CharField(max_length=120, blank=True, default="")
    designation = models.CharField(max_length=120, blank=True, default="")
    joining_date = models.DateField(null=True, blank=True)
    employment_type = models.CharField(
        max_length=20, choices=EmploymentType.choices, blank=True, default=""
    )
    reporting_manager = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="subordinates",
    )
    salary = models.PositiveIntegerField(null=True, blank=True)
    login_enabled = models.BooleanField(default=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.staff_id} - {self.user.full_name}"


class StaffActivity(models.Model):
    """Append-only audit trail for staff changes."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff = models.ForeignKey(
        StaffMember, related_name="activity", on_delete=models.CASCADE
    )
    action = models.CharField(max_length=160)
    actor = models.CharField(max_length=120)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self) -> str:
        return f"{self.action} — {self.staff}"
