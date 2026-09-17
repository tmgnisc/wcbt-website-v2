"""
Views for the College Settings API.
"""

import logging

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.api.permissions import IsSuperAdmin
from apps.common.responses import error_response, success_response

from apps.collegesettings.models import CollegeInfo
from apps.collegesettings.api.serializers import CollegeInfoSerializer

User = get_user_model()
logger = logging.getLogger("apps")


class CollegeInfoView(APIView):
    """
    Retrieve or update college settings (singleton resource).
    GET /api/settings/ — Retrieve
    PUT/PATCH /api/settings/ — Update
    """

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, *args, **kwargs):
        info = CollegeInfo.load()
        serializer = CollegeInfoSerializer(info)
        return success_response(data=serializer.data, message="College info retrieved")

    def put(self, request, *args, **kwargs):
        info = CollegeInfo.load()
        serializer = CollegeInfoSerializer(info, data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        logger.info("College info updated")
        return success_response(
            data=serializer.data,
            message="College info updated successfully",
        )

    def patch(self, request, *args, **kwargs):
        info = CollegeInfo.load()
        serializer = CollegeInfoSerializer(info, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        logger.info("College info updated")
        return success_response(
            data=serializer.data,
            message="College info updated successfully",
        )


class PermissionsView(APIView):
    """
    GET /api/settings/permissions/ — Retrieve permissions
    PATCH /api/settings/permissions/ — Update permissions
    """

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, *args, **kwargs):
        info = CollegeInfo.load()
        return success_response(
            data=info.permissions or {},
            message="Permissions retrieved",
        )

    def patch(self, request, *args, **kwargs):
        info = CollegeInfo.load()
        info.permissions = request.data.get("permissions", info.permissions)
        info.save(update_fields=["permissions"])
        logger.info("Permissions updated")
        return success_response(
            data=info.permissions,
            message="Permissions updated successfully",
        )


class SettingsUserListView(APIView):
    """
    GET /api/settings/users/ — List all users
    POST /api/settings/users/ — Create a new user (admin or staff)
    """

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, *args, **kwargs):
        users = User.objects.all().order_by("-created_at")
        data = []
        for u in users:
            data.append({
                "id": str(u.id),
                "name": u.full_name,
                "email": u.email,
                "role": u.role,
                "status": "Active" if u.is_active else "Inactive",
                "createdAt": u.created_at.isoformat() if hasattr(u, "created_at") and u.created_at else None,
            })
        return success_response(data=data, message="Users retrieved")

    def post(self, request, *args, **kwargs):
        email = request.data.get("email", "")
        first_name = request.data.get("firstName", "")
        last_name = request.data.get("lastName", "")
        role = request.data.get("role", "staff")
        password = request.data.get("password", "ChangeMe@123")

        if not email or not first_name or not last_name:
            return error_response(
                message="Email, firstName, and lastName are required",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return error_response(
                message="A user with this email already exists",
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            role=role,
            username=email.split("@")[0],
        )

        logger.info("User created via settings: %s", user.email)

        return success_response(
            data={
                "id": str(user.id),
                "name": user.full_name,
                "email": user.email,
                "role": user.role,
                "status": "Active",
            },
            message="User created successfully",
            status=status.HTTP_201_CREATED,
        )


class SettingsUserDetailView(APIView):
    """
    DELETE /api/settings/users/<uuid>/ — Deactivate a user
    """

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def delete(self, request, *args, **kwargs):
        user_id = kwargs.get("pk")
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return error_response(
                message="User not found",
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.role == User.Role.SUPER_ADMIN:
            return error_response(
                message="Cannot deactivate a super admin",
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = False
        user.save(update_fields=["is_active"])
        logger.info("User deactivated: %s", user.email)
        return success_response(message="User deactivated successfully")
