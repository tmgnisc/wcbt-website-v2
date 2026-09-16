"""
URL configuration for the authentication API.
"""

from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    MeView,
    ProfileView,
    SignupView,
    TokenRefreshView,
)

app_name = "authentication"

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("profile/", ProfileView.as_view(), name="profile"),
]
