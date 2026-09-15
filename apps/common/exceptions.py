"""
Global exception handlers.
"""

import logging

from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler

logger = logging.getLogger("apps")


class ApplicationError(APIException):
    """Base application error."""

    status_code = 400
    default_detail = "An application error occurred."

    def __init__(self, detail=None, status_code=None):
        super().__init__(detail)
        if status_code is not None:
            self.status_code = status_code


def custom_exception_handler(exc, context):
    """Custom DRF exception handler."""
    response = exception_handler(exc, context)

    if response is not None:
        errors = {}
        if isinstance(response.data, dict):
            errors = response.data
        elif isinstance(response.data, list):
            errors = {"detail": response.data}

        response.data = {
            "success": False,
            "message": "An error occurred",
            "errors": errors,
        }
    else:
        logger.exception("Unhandled exception: %s", exc)

    return response
