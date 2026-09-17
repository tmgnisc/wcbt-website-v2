"""
Models for the College Settings app.
"""

import uuid

from django.db import models


class CollegeInfo(models.Model):
    """Singleton model for college information/settings."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    college_name = models.CharField(max_length=255, default="WhiteHouse College of Business & Technology")
    college_code = models.CharField(max_length=32, default="WCBT")
    address = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    website = models.URLField(blank=True, default="")
    logo_url = models.URLField(blank=True, default="")
    established_date = models.DateField(null=True, blank=True)
    motto = models.CharField(max_length=255, blank=True, default="")
    academic_year_start = models.PositiveSmallIntegerField(default=1)
    max_students_per_program = models.PositiveIntegerField(default=500)
    enable_email_notifications = models.BooleanField(default=True)
    enable_sms_notifications = models.BooleanField(default=False)
    default_password = models.CharField(max_length=128, default="ChangeMe@123")
    catalog = models.JSONField(default=dict, blank=True)
    permissions = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "College Info"
        verbose_name_plural = "College Info"

    def __str__(self):
        return self.college_name

    def save(self, *args, **kwargs):
        # Singleton pattern: only allow one instance
        self.pk = self.id
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        """Load or create the singleton instance."""
        obj, created = cls.objects.get_or_create(pk=uuid.UUID(int=1))
        return obj
