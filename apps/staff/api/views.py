"""
Views for the Staff API.
"""

import logging
from datetime import date

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.authentication.api.permissions import IsAdmin, IsSuperAdmin, IsStaffUser
from apps.common.responses import error_response, success_response
from apps.email_verification.services import send_password_reset_otp, reset_password

User = get_user_model()

from apps.staff.models import StaffActivity, StaffMember
from apps.staff.api.serializers import (
    StaffCreateSerializer,
    StaffDetailSerializer,
    StaffListSerializer,
)

logger = logging.getLogger("apps")


def _generate_staff_id() -> str:
    """Generate next staff ID: WCBT-S-0001."""
    last = StaffMember.objects.order_by("-created_at").first()
    if last and last.staff_id:
        num = int(last.staff_id.split("-")[-1]) + 1
    else:
        num = 1
    return f"WCBT-S-{num:04d}"


class StaffListCreateView(generics.ListCreateAPIView):
    """List all staff or create a new staff member."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StaffCreateSerializer
        return StaffListSerializer

    def get_queryset(self):
        return StaffMember.objects.select_related("user").all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        with transaction.atomic():
            # Create User account
            user = User.objects.create_user(
                email=data["email"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                password="ChangeMe@123",  # Default password
                role=data["role"],
                username=data["email"].split("@")[0],
            )

            # Create StaffMember
            staff = StaffMember.objects.create(
                staff_id=_generate_staff_id(),
                user=user,
                gender=data.get("gender", ""),
                date_of_birth=data.get("date_of_birth"),
                citizenship_no=data.get("citizenship_no", ""),
                address=data.get("address", ""),
                phone=data.get("phone", ""),
                department=data.get("department", ""),
                designation=data.get("designation", ""),
                joining_date=data.get("joining_date"),
                employment_type=data.get("employment_type", ""),
                reporting_manager_id=data.get("reporting_manager_id"),
                salary=data.get("salary"),
            )

            # Create activity entry
            StaffActivity.objects.create(
                staff=staff,
                action="Profile created",
                actor=request.user.full_name,
            )

        logger.info("Staff created: %s", staff.staff_id)

        return success_response(
            data=StaffDetailSerializer(staff, context={"request": request}).data,
            message="Staff created successfully",
            status=status.HTTP_201_CREATED,
        )


class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a staff member."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = StaffMember.objects.select_related("user").all()

    def get_serializer_class(self):
        if self.request.method == "PATCH" or self.request.method == "PUT":
            return StaffCreateSerializer
        return StaffDetailSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        with transaction.atomic():
            # Update user fields
            user = instance.user
            if "first_name" in data:
                user.first_name = data["first_name"]
            if "last_name" in data:
                user.last_name = data["last_name"]
            if "role" in data:
                user.role = data["role"]
            user.save()

            # Update staff fields
            field_map = {
                "gender": "gender",
                "date_of_birth": "date_of_birth",
                "citizenship_no": "citizenship_no",
                "address": "address",
                "phone": "phone",
                "department": "department",
                "designation": "designation",
                "joining_date": "joining_date",
                "employment_type": "employment_type",
                "reporting_manager_id": "reporting_manager_id",
                "salary": "salary",
            }
            for data_key, model_field in field_map.items():
                if data_key in data:
                    setattr(instance, model_field, data[data_key])

            instance.save()

            StaffActivity.objects.create(
                staff=instance,
                action="Profile updated",
                actor=request.user.full_name,
            )

        return success_response(
            data=StaffDetailSerializer(instance, context={"request": request}).data,
            message="Staff updated successfully",
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.user.is_active = False
        instance.user.save()
        instance.status = "Inactive"
        instance.save()
        logger.info("Staff deactivated: %s", instance.staff_id)
        return success_response(message="Staff deactivated successfully")


class StaffToggleStatusView(generics.GenericAPIView):
    """Toggle staff active/inactive status."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = StaffMember.objects.all()

    def patch(self, request, *args, **kwargs):
        staff = self.get_object()
        staff.login_enabled = not staff.login_enabled
        staff.save(update_fields=["login_enabled"])
        staff.user.is_active = staff.login_enabled
        staff.user.save(update_fields=["is_active"])

        StaffActivity.objects.create(
            staff=staff,
            action=f"Login {'enabled' if staff.login_enabled else 'disabled'}",
            actor=request.user.full_name,
        )

        return success_response(
            data={"loginEnabled": staff.login_enabled},
            message=f"Staff {'activated' if staff.login_enabled else 'deactivated'}",
        )


class StaffPasswordResetView(generics.GenericAPIView):
    """Send a password reset email to a staff member."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = StaffMember.objects.select_related("user").all()

    def post(self, request, *args, **kwargs):
        staff = self.get_object()
        try:
            send_password_reset_otp(staff.user.email)
        except Exception as e:
            logger.error("Failed to send password reset email: %s", e)
            return error_response(
                message="Failed to send reset email. Please try again.",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        StaffActivity.objects.create(
            staff=staff,
            action="Password reset requested",
            actor=request.user.full_name,
        )

        return success_response(message="Password reset link sent to email")


class StaffSetPasswordView(generics.GenericAPIView):
    """Admin directly sets a new password for a staff member (no email needed)."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = StaffMember.objects.select_related("user").all()

    def post(self, request, *args, **kwargs):
        staff = self.get_object()
        new_password = request.data.get("newPassword", "")
        if not new_password or len(new_password) < 8:
            return error_response(
                message="Password must be at least 8 characters",
                status=status.HTTP_400_BAD_REQUEST,
            )

        staff.user.set_password(new_password)
        staff.user.save(update_fields=["password"])

        StaffActivity.objects.create(
            staff=staff,
            action="Password reset by admin",
            actor=request.user.full_name,
        )

        return success_response(message="Password updated successfully")
