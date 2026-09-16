"""
URL patterns for the College Settings API.
"""

from django.urls import path

from apps.collegesettings.api import views

app_name = "collegesettings"

urlpatterns = [
    path("", views.CollegeInfoView.as_view(), name="college-info"),
]
