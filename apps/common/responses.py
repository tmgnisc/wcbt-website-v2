"""
Standardized API response helpers.
"""

from rest_framework.response import Response


def success_response(data=None, message="Request successful", status=200):
    """Return a standardized success response."""
    payload = {
        "success": True,
        "message": message,
        "data": data,
    }
    return Response(payload, status=status)


def error_response(message="An error occurred", errors=None, status=400):
    """Return a standardized error response."""
    payload = {
        "success": False,
        "message": message,
        "errors": errors or {},
    }
    return Response(payload, status=status)
