"""
URL configuration for the Staff API.
"""

from django.urls import path

from apps.staff.api.views import StaffDetailView, StaffListCreateView, StaffToggleStatusView

app_name = "staff"

urlpatterns = [
    path("", StaffListCreateView.as_view(), name="staff-list"),
    path("<uuid:pk>/", StaffDetailView.as_view(), name="staff-detail"),
    path("<uuid:pk>/toggle-status/", StaffToggleStatusView.as_view(), name="staff-toggle-status"),
]
