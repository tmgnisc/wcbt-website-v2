"""
Views for the Admissions API.
"""

import logging
from collections import Counter
from datetime import timedelta

from django.db import transaction
from django.db.models import Count
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.authentication.api.permissions import IsAdmin
from apps.common.responses import error_response, success_response

from apps.admissions.models import Admission, AdmissionActivity
from apps.admissions.api.serializers import (
    AdmissionCreateSerializer,
    AdmissionDetailSerializer,
    AdmissionListSerializer,
    AdmissionStatusSerializer,
    BulkActionSerializer,
)

logger = logging.getLogger("apps")


class AdmissionListCreateView(generics.ListCreateAPIView):
    """List all admissions or create a new admission."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdmissionCreateSerializer
        return AdmissionListSerializer

    def get_queryset(self):
        return Admission.objects.select_related("program").all()

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
            admission = Admission.objects.create(
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                phone=data.get("phone", ""),
                program_id=data.get("program"),
                notes=data.get("notes", ""),
                documents=data.get("documents", {}),
            )

            AdmissionActivity.objects.create(
                admission=admission,
                action="Application submitted",
                actor=request.user.full_name,
            )

        logger.info("Admission created: %s", admission.email)

        return success_response(
            data=AdmissionDetailSerializer(admission, context={"request": request}).data,
            message="Admission created successfully",
            status=status.HTTP_201_CREATED,
        )


class AdmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an admission."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Admission.objects.select_related("program").all()

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return AdmissionCreateSerializer
        return AdmissionDetailSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data, partial=True, context={"instance": instance})
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        with transaction.atomic():
            for field in ["first_name", "last_name", "email", "phone", "notes", "documents"]:
                if field in data:
                    setattr(instance, field, data[field])
            if "program" in data:
                instance.program_id = data["program"]
            instance.save()

            AdmissionActivity.objects.create(
                admission=instance,
                action="Application updated",
                actor=request.user.full_name,
            )

        return success_response(
            data=AdmissionDetailSerializer(instance, context={"request": request}).data,
            message="Admission updated successfully",
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = Admission.Status.INACTIVE
        instance.save()
        logger.info("Admission deactivated: %s", instance.email)
        return success_response(message="Admission deactivated successfully")


class AdmissionStatusView(generics.GenericAPIView):
    """Update admission stage/status."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Admission.objects.all()

    def patch(self, request, *args, **kwargs):
        admission = self.get_object()
        serializer = AdmissionStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        with transaction.atomic():
            if "stage" in data:
                old_stage = admission.stage
                admission.stage = data["stage"]
                AdmissionActivity.objects.create(
                    admission=admission,
                    action=f"Stage changed: {old_stage} → {data['stage']}",
                    actor=request.user.full_name,
                )

            if "status" in data:
                admission.status = data["status"]
                AdmissionActivity.objects.create(
                    admission=admission,
                    action=f"Status changed to {data['status']}",
                    actor=request.user.full_name,
                )

            if "notes" in data:
                admission.notes = data["notes"]

            admission.save()

        return success_response(
            data=AdmissionDetailSerializer(admission, context={"request": request}).data,
            message="Admission status updated successfully",
        )


class AdmissionBulkActionView(generics.GenericAPIView):
    """Bulk operations on admissions."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, *args, **kwargs):
        serializer = BulkActionSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        ids = data["ids"]
        action = data["action"]
        admissions = Admission.objects.filter(id__in=ids)

        with transaction.atomic():
            if action == "delete":
                count = admissions.update(status=Admission.Status.INACTIVE)
                message = f"{count} admissions deactivated"
            elif action == "stage":
                stage = data.get("stage")
                if not stage:
                    return error_response(
                        message="Stage is required for stage action",
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                count = admissions.update(stage=stage)
                for admission in admissions:
                    AdmissionActivity.objects.create(
                        admission=admission,
                        action=f"Bulk stage change to {stage}",
                        actor=request.user.full_name,
                    )
                message = f"{count} admissions updated to {stage}"
            elif action == "status":
                new_status = data.get("status")
                if not new_status:
                    return error_response(
                        message="Status is required for status action",
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                count = admissions.update(status=new_status)
                for admission in admissions:
                    AdmissionActivity.objects.create(
                        admission=admission,
                        action=f"Bulk status change to {new_status}",
                        actor=request.user.full_name,
                    )
                message = f"{count} admissions updated to {new_status}"

        return success_response(
            data={"affected": count},
            message=message,
        )


class AdmissionTrendView(generics.GenericAPIView):
    """Get admission trends for the last 30 days."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, *args, **kwargs):
        thirty_days_ago = timezone.now().date() - timedelta(days=30)

        admissions = Admission.objects.filter(applied_date__gte=thirty_days_ago)

        daily_counts = (
            admissions.values("applied_date")
            .annotate(count=Count("id"))
            .order_by("applied_date")
        )

        stage_counts = Counter(admissions.values_list("stage", flat=True))

        trend_data = {
            "total": admissions.count(),
            "daily": [
                {"date": str(item["applied_date"]), "count": item["count"]}
                for item in daily_counts
            ],
            "by_stage": dict(stage_counts),
        }

        return success_response(data=trend_data, message="Admission trends retrieved")


class AdmissionConvertView(generics.GenericAPIView):
    """Convert an admission to a student (placeholder)."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Admission.objects.all()

    def post(self, request, *args, **kwargs):
        admission = self.get_object()

        if admission.stage != Admission.Stage.ENROLLED:
            return error_response(
                message="Only enrolled admissions can be converted",
                status=status.HTTP_400_BAD_REQUEST,
            )

        AdmissionActivity.objects.create(
            admission=admission,
            action="Converted to student",
            actor=request.user.full_name,
        )

        return success_response(
            data={"admission_id": str(admission.id), "status": "converted"},
            message="Admission converted to student successfully",
        )
