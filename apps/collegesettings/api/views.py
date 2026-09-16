"""
Views for the College Settings API.
"""

import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.api.permissions import IsSuperAdmin
from apps.common.responses import error_response, success_response

from apps.collegesettings.models import CollegeInfo
from apps.collegesettings.api.serializers import CollegeInfoSerializer

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
