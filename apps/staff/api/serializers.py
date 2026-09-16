"""
Serializers for the Staff API.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.staff.models import StaffActivity, StaffMember

User = get_user_model()


class StaffActivitySerializer(serializers.ModelSerializer):
    """Serializer for staff activity entries."""

    class Meta:
        model = StaffActivity
        fields = ["id", "action", "actor", "timestamp"]
        read_only_fields = fields


class StaffListSerializer(serializers.ModelSerializer):
    """Serializer for staff list."""

    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    staff_id = serializers.CharField(read_only=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    photo_url = serializers.URLField(required=False, allow_null=True)
    joining_date = serializers.DateField(required=False, allow_null=True)
    employment_type = serializers.CharField(required=False, default="")
    reporting_manager_id = serializers.UUIDField(required=False, allow_null=True)
    login_enabled = serializers.BooleanField(read_only=True)

    class Meta:
        model = StaffMember
        fields = [
            "id",
            "staff_id",
            "full_name",
            "email",
            "gender",
            "date_of_birth",
            "citizenship_no",
            "address",
            "phone",
            "photo_url",
            "department",
            "designation",
            "joining_date",
            "employment_type",
            "reporting_manager_id",
            "salary",
            "login_enabled",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "staff_id",
            "login_enabled",
            "status",
            "created_at",
            "updated_at",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if request and request.user.role != "super_admin":
            data.pop("salary", None)
        return data


class StaffDetailSerializer(serializers.ModelSerializer):
    """Serializer for staff detail."""

    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    activity = StaffActivitySerializer(many=True, read_only=True)
    documents = serializers.SerializerMethodField()
    staff_id = serializers.CharField(read_only=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    photo_url = serializers.URLField(required=False, allow_null=True)
    joining_date = serializers.DateField(required=False, allow_null=True)
    employment_type = serializers.CharField(required=False, default="")
    reporting_manager_id = serializers.UUIDField(required=False, allow_null=True)
    login_enabled = serializers.BooleanField(read_only=True)

    class Meta:
        model = StaffMember
        fields = [
            "id",
            "staff_id",
            "full_name",
            "email",
            "gender",
            "date_of_birth",
            "citizenship_no",
            "address",
            "phone",
            "photo_url",
            "department",
            "designation",
            "joining_date",
            "employment_type",
            "reporting_manager_id",
            "salary",
            "login_enabled",
            "status",
            "documents",
            "activity",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "staff_id",
            "login_enabled",
            "activity",
            "created_at",
            "updated_at",
        ]

    def get_documents(self, obj):
        return []

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if request and request.user.role != "super_admin":
            data.pop("salary", None)
        return data


class StaffCreateSerializer(serializers.Serializer):
    """Serializer for creating/updating a staff member."""

    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    gender = serializers.ChoiceField(choices=StaffMember.Gender.choices, required=False, default="")
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    citizenship_no = serializers.CharField(max_length=32, required=False, default="")
    address = serializers.CharField(max_length=255, required=False, default="")
    phone = serializers.CharField(max_length=20, required=False, default="")
    department = serializers.CharField(max_length=120, required=False, default="")
    designation = serializers.CharField(max_length=120, required=False, default="")
    joining_date = serializers.DateField(required=False, allow_null=True)
    employment_type = serializers.ChoiceField(
        choices=StaffMember.EmploymentType.choices, required=False, default=""
    )
    reporting_manager_id = serializers.UUIDField(required=False, allow_null=True)
    salary = serializers.IntegerField(required=False, allow_null=True)
    role = serializers.ChoiceField(choices=["admin", "staff"], default="staff")

    def validate_email(self, value):
        user = self.context.get("user")
        if User.objects.filter(email=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
