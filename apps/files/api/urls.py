"""
URL patterns for the File Upload API.
"""

from django.urls import path

from apps.files.api import views

app_name = "files"

urlpatterns = [
    path("upload/", views.FileUploadView.as_view(), name="file-upload"),
    path("", views.FileListView.as_view(), name="file-list"),
    path("<uuid:pk>/", views.FileDeleteView.as_view(), name="file-delete"),
]
