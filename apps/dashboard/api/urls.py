"""
URL patterns for the Dashboard API.
"""

from django.urls import path

from apps.dashboard.api import views

app_name = "dashboard"

urlpatterns = [
    path("", views.DashboardSummaryView.as_view(), name="dashboard-summary"),
]
