"""
URL patterns for the College Settings API.
"""

from django.urls import path

from apps.collegesettings.api import views

app_name = "collegesettings"

urlpatterns = [
    path("", views.CollegeInfoView.as_view(), name="college-info"),
    path("permissions/", views.PermissionsView.as_view(), name="settings-permissions"),
    path("users/", views.SettingsUserListView.as_view(), name="settings-users"),
    path("users/<uuid:pk>/", views.SettingsUserDetailView.as_view(), name="settings-user-detail"),
]
