"""
Serializers for the Programs API.
"""

from rest_framework import serializers

from apps.programs.models import Program


class ProgramListSerializer(serializers.ModelSerializer):
    """Serializer for program list."""

    class Meta:
        model = Program
        fields = [
            "id",
            "code",
            "name",
            "level",
            "department",
            "affiliation",
            "duration_years",
            "semesters",
            "seats",
            "fee_per_year",
            "coordinator",
            "status",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProgramDetailSerializer(serializers.ModelSerializer):
    """Serializer for program detail."""

    class Meta:
        model = Program
        fields = [
            "id",
            "code",
            "name",
            "level",
            "department",
            "affiliation",
            "duration_years",
            "semesters",
            "seats",
            "fee_per_year",
            "coordinator",
            "status",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
