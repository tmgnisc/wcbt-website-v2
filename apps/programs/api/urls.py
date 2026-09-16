"""
URL configuration for the Programs API.
"""

from django.urls import path

from apps.programs.api.views import ProgramDetailView, ProgramListCreateView

app_name = "programs"

urlpatterns = [
    path("", ProgramListCreateView.as_view(), name="program-list"),
    path("<uuid:pk>/", ProgramDetailView.as_view(), name="program-detail"),
]
