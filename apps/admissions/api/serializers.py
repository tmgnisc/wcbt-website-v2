"""
Serializers for the Admissions API.
"""

from rest_framework import serializers

from apps.admissions.models import Admission, AdmissionActivity


class AdmissionActivitySerializer(serializers.ModelSerializer):
    """Serializer for admission activity entries."""

    class Meta:
        model = AdmissionActivity
        fields = ["id", "action", "actor", "timestamp"]
        read_only_fields = fields


class AdmissionListSerializer(serializers.ModelSerializer):
    """Serializer for admission list."""

    full_name = serializers.SerializerMethodField()
    program_name = serializers.CharField(source="program.name", read_only=True, default="")

    class Meta:
        model = Admission
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "program",
            "program_name",
            "stage",
            "status",
            "applied_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "applied_date", "created_at", "updated_at"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class AdmissionDetailSerializer(serializers.ModelSerializer):
    """Serializer for admission detail."""

    full_name = serializers.SerializerMethodField()
    program_name = serializers.CharField(source="program.name", read_only=True, default="")
    activity = AdmissionActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Admission
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "program",
            "program_name",
            "stage",
            "status",
            "applied_date",
            "notes",
            "documents",
            "activity",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "applied_date", "created_at", "updated_at"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class AdmissionCreateSerializer(serializers.Serializer):
    """Serializer for creating/updating an admission."""

    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default="")
    program = serializers.UUIDField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, default="")
    documents = serializers.JSONField(required=False, default=dict)

    def validate_email(self, value):
        instance = self.context.get("instance")
        qs = Admission.objects.filter(email=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An admission with this email already exists.")
        return value


class AdmissionStatusSerializer(serializers.Serializer):
    """Serializer for updating admission stage/status."""

    stage = serializers.ChoiceField(choices=Admission.Stage.choices, required=False)
    status = serializers.ChoiceField(choices=Admission.Status.choices, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)


class BulkActionSerializer(serializers.Serializer):
    """Serializer for bulk admission actions."""

    ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)
    action = serializers.ChoiceField(choices=["stage", "status", "delete"])
    stage = serializers.ChoiceField(choices=Admission.Stage.choices, required=False)
    status = serializers.ChoiceField(choices=Admission.Status.choices, required=False)
