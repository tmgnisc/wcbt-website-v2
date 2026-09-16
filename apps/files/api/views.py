"""
Views for the File Upload API.
"""

import logging
import mimetypes

from django.db import transaction
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.authentication.api.permissions import IsAdmin
from apps.common.responses import error_response, success_response

from apps.files.models import UploadedFile
from apps.files.api.serializers import FileUploadSerializer, UploadedFileSerializer

logger = logging.getLogger("apps")

# 10MB max file size
MAX_FILE_SIZE = 10 * 1024 * 1024


class FileUploadView(generics.CreateAPIView):
    """Upload a file."""

    permission_classes = [IsAuthenticated, IsAdmin]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = FileUploadSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_obj = serializer.validated_data["file"]
        category = serializer.validated_data.get("category", UploadedFile.Category.GENERAL)

        # Check file size
        if file_obj.size > MAX_FILE_SIZE:
            return error_response(
                message="File size exceeds 10MB limit",
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get MIME type
        mime_type, _ = mimetypes.guess_type(file_obj.name)
        if not mime_type:
            mime_type = file_obj.content_type or "application/octet-stream"

        with transaction.atomic():
            uploaded = UploadedFile.objects.create(
                file=file_obj,
                original_name=file_obj.name,
                file_size=file_obj.size,
                mime_type=mime_type,
                category=category,
                uploaded_by=request.user,
            )

        logger.info("File uploaded: %s by %s", uploaded.original_name, request.user.email)

        return success_response(
            data=UploadedFileSerializer(uploaded, context={"request": request}).data,
            message="File uploaded successfully",
            status=status.HTTP_201_CREATED,
        )


class FileListView(generics.ListAPIView):
    """List uploaded files."""

    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UploadedFileSerializer

    def get_queryset(self):
        queryset = UploadedFile.objects.select_related("uploaded_by").all()
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
        return queryset


class FileDeleteView(generics.DestroyAPIView):
    """Delete an uploaded file."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = UploadedFile.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Delete the actual file from storage
        if instance.file:
            instance.file.delete(save=False)
        instance.delete()
        logger.info("File deleted: %s", instance.original_name)
        return success_response(message="File deleted successfully")
