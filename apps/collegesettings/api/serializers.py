"""
Serializers for the College Settings API.
"""

from rest_framework import serializers

from apps.collegesettings.models import CollegeInfo


class CollegeInfoSerializer(serializers.ModelSerializer):
    """Serializer for college info (singleton)."""

    class Meta:
        model = CollegeInfo
        fields = [
            "id",
            "college_name",
            "college_code",
            "address",
            "phone",
            "email",
            "website",
            "logo_url",
            "established_date",
            "motto",
            "academic_year_start",
            "max_students_per_program",
            "enable_email_notifications",
            "enable_sms_notifications",
            "default_password",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
