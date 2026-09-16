"""
URL configuration for the College Management System.
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # API
    path("api/auth/", include("apps.authentication.api.urls")),
    path("api/auth/", include("apps.email_verification.api.urls")),
    path("api/programs/", include("apps.programs.api.urls")),
    path("api/staff/", include("apps.staff.api.urls")),
    path("api/admissions/", include("apps.admissions.api.urls")),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]
