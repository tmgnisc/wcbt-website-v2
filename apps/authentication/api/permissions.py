"""
Custom permission classes for role-based access control.
"""

from rest_framework.permissions import BasePermission

from apps.authentication.models import User


class IsStaffUser(BasePermission):
    """
    Allow access to Staff and SuperAdmin users.
    SuperAdmin inherits all Staff permissions.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in (User.Role.STAFF, User.Role.SUPERADMIN)
        )


class IsSuperAdmin(BasePermission):
    """
    Allow access to SuperAdmin users only.
    Used for staff management endpoints.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.SUPERADMIN
        )
