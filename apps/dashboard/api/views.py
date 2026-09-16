"""
Views for the Dashboard API.
"""

from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.api.permissions import IsAdmin
from apps.common.responses import success_response


class DashboardSummaryView(APIView):
    """GET /api/dashboard/ — Dashboard summary statistics."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, *args, **kwargs):
        from apps.admissions.models import Admission
        from apps.files.models import UploadedFile
        from apps.notifications.models import Notification
        from apps.programs.models import Program
        from apps.staff.models import StaffMember

        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # Counts
        total_staff = StaffMember.objects.count()
        active_staff = StaffMember.objects.filter(status="Active").count()
        total_programs = Program.objects.count()
        active_programs = Program.objects.filter(status="Active").count()
        total_admissions = Admission.objects.count()
        pending_admissions = Admission.objects.filter(
            stage__in=["Applied", "Document Verification", "Test/Interview"]
        ).count()
        enrolled_admissions = Admission.objects.filter(stage="Enrolled").count()
        total_notifications = Notification.objects.count()
        unread_notifications = Notification.objects.filter(is_read=False).count()
        total_files = UploadedFile.objects.count()

        # Recent admissions (last 30 days)
        recent_admissions = Admission.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()

        # Admissions by stage
        admissions_by_stage = dict(
            Admission.objects.values_list("stage")
            .annotate(count=Count("id"))
            .values_list("stage", "count")
        )

        # Staff by department
        staff_by_department = dict(
            StaffMember.objects.exclude(department="")
            .values_list("department")
            .annotate(count=Count("id"))
            .values_list("department", "count")
        )

        summary = {
            "staff": {
                "total": total_staff,
                "active": active_staff,
                "inactive": total_staff - active_staff,
                "by_department": staff_by_department,
            },
            "programs": {
                "total": total_programs,
                "active": active_programs,
                "inactive": total_programs - active_programs,
            },
            "admissions": {
                "total": total_admissions,
                "pending": pending_admissions,
                "enrolled": enrolled_admissions,
                "recent_30_days": recent_admissions,
                "by_stage": admissions_by_stage,
            },
            "notifications": {
                "total": total_notifications,
                "unread": unread_notifications,
            },
            "files": {
                "total": total_files,
            },
        }

        return success_response(data=summary, message="Dashboard summary retrieved")
