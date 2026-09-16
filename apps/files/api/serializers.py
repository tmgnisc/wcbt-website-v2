"""
Serializers for the File Upload API.
"""

from rest_framework import serializers

from apps.files.models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    """Serializer for uploaded files."""

    uploaded_by_name = serializers.CharField(
        source="uploaded_by.full_name", read_only=True, default=""
    )
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "file",
            "file_url",
            "original_name",
            "file_size",
            "mime_type",
            "category",
            "uploaded_by",
            "uploaded_by_name",
            "created_at",
        ]
        read_only_fields = ["id", "file_size", "mime_type", "uploaded_by", "created_at"]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return ""


class FileUploadSerializer(serializers.Serializer):
    """Serializer for file upload request."""

    file = serializers.FileField()
    category = serializers.ChoiceField(
        choices=UploadedFile.Category.choices,
        default=UploadedFile.Category.GENERAL,
    )
