"""
Views for the Programs API.
"""

import logging

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from apps.common.responses import error_response, success_response

from apps.programs.models import Program
from apps.programs.api.serializers import ProgramDetailSerializer, ProgramListSerializer  # noqa: E501

logger = logging.getLogger("apps")


class ProgramListCreateView(generics.ListCreateAPIView):
    """List all programs or create a new one."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProgramDetailSerializer
        return ProgramListSerializer

    def get_queryset(self):
        return Program.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        code = serializer.validated_data["code"]
        if Program.objects.filter(code__iexact=code).exists():
            return error_response(
                message="A program with this code already exists.",
                errors={"code": [f"{code} is already used by another program."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        program = serializer.save()
        logger.info("Program created: %s", program.code)

        return success_response(
            data=ProgramDetailSerializer(program).data,
            message="Program created successfully",
            status=status.HTTP_201_CREATED,
        )


class ProgramDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a program."""

    permission_classes = [IsAuthenticated]
    queryset = Program.objects.all()
    serializer_class = ProgramDetailSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_code = serializer.validated_data.get("code", instance.code)
        if Program.objects.filter(code__iexact=new_code).exclude(id=instance.id).exists():
            return error_response(
                message="A program with this code already exists.",
                errors={"code": [f"{new_code} is already used by another program."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        program = serializer.save()
        logger.info("Program updated: %s", program.code)

        return success_response(
            data=ProgramDetailSerializer(program).data,
            message="Program updated successfully",
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        logger.info("Program deleted: %s", instance.code)
        return success_response(message="Program deleted successfully")
