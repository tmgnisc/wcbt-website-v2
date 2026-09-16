"""
Program model.
"""

import uuid

from django.db import models


class Program(models.Model):
    """Academic program offered by the college."""

    class Level(models.TextChoices):
        BACHELOR = "Bachelor", "Bachelor"
        MASTER = "Master", "Master"
        DIPLOMA = "Diploma", "Diploma"
        CERTIFICATE = "Certificate", "Certificate"

    class Status(models.TextChoices):
        ACTIVE = "Active", "Active"
        INACTIVE = "Inactive", "Inactive"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=120)
    level = models.CharField(max_length=16, choices=Level.choices)
    department = models.CharField(max_length=120)
    affiliation = models.CharField(max_length=120)
    duration_years = models.PositiveSmallIntegerField()
    semesters = models.PositiveSmallIntegerField()
    seats = models.PositiveSmallIntegerField()
    fee_per_year = models.PositiveIntegerField()
    coordinator = models.CharField(max_length=120)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.ACTIVE
    )
    description = models.CharField(max_length=240, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.code} - {self.name}"
