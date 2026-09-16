"""
Custom permission classes for role-based access control.
"""

from rest_framework.permissions import BasePermission

from apps.authentication.models import User


class IsStaffUser(BasePermission):
    """
    Allow access to Staff, Admin, and SuperAdmin users.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in (
                User.Role.STAFF,
                User.Role.ADMIN,
                User.Role.SUPER_ADMIN,
            )
        )


class IsAdmin(BasePermission):
    """
    Allow access to Admin and SuperAdmin users.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in (User.Role.ADMIN, User.Role.SUPER_ADMIN)
        )


class IsSuperAdmin(BasePermission):
    """
    Allow access to SuperAdmin users only.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.SUPER_ADMIN
        )
