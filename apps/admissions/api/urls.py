"""
URL patterns for the Admissions API.
"""

from django.urls import path

from apps.admissions.api import views

app_name = "admissions"

urlpatterns = [
    path("", views.AdmissionListCreateView.as_view(), name="admission-list-create"),
    path("<uuid:pk>/", views.AdmissionDetailView.as_view(), name="admission-detail"),
    path("<uuid:pk>/status/", views.AdmissionStatusView.as_view(), name="admission-status"),
    path("<uuid:pk>/convert/", views.AdmissionConvertView.as_view(), name="admission-convert"),
    path("bulk-action/", views.AdmissionBulkActionView.as_view(), name="admission-bulk-action"),
    path("trend/", views.AdmissionTrendView.as_view(), name="admission-trend"),
]
