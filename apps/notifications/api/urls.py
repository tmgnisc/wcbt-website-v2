"""
URL patterns for the Notifications API.
"""

from django.urls import path

from apps.notifications.api import views

app_name = "notifications"

urlpatterns = [
    path("", views.NotificationListCreateView.as_view(), name="notification-list-create"),
    path("<uuid:pk>/", views.NotificationDetailView.as_view(), name="notification-detail"),
    path("<uuid:pk>/publish/", views.NotificationPublishView.as_view(), name="notification-publish"),
    path("<uuid:pk>/read/", views.NotificationMarkReadView.as_view(), name="notification-mark-read"),
    path("bulk-action/", views.NotificationBulkActionView.as_view(), name="notification-bulk-action"),
]
