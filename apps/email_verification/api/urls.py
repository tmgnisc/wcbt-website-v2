"""
URL configuration for email verification API.
"""

from django.urls import path

from .views import (
    ForgotPasswordView,
    ResetPasswordView,
    SendOtpView,
    VerifyOtpView,
)

app_name = "email_verification"

urlpatterns = [
    path("send-otp/", SendOtpView.as_view(), name="send-otp"),
    path("verify-otp/", VerifyOtpView.as_view(), name="verify-otp"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]
