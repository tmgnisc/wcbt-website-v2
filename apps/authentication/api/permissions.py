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


# Portal permission mapping: (portal, action) -> allowed roles
PORTAL_PERMISSIONS = {
    # Staff portal
    ("staff", "read"): [User.Role.STAFF, User.Role.ADMIN, User.Role.SUPER_ADMIN],
    ("staff", "write"): [User.Role.ADMIN, User.Role.SUPER_ADMIN],
    # Admissions portal
    ("admissions", "read"): [User.Role.STAFF, User.Role.ADMIN, User.Role.SUPER_ADMIN],
    ("admissions", "write"): [User.Role.ADMIN, User.Role.SUPER_ADMIN],
    # Programs portal
    ("programs", "read"): [User.Role.STAFF, User.Role.ADMIN, User.Role.SUPER_ADMIN],
    ("programs", "write"): [User.Role.ADMIN, User.Role.SUPER_ADMIN],
    # Notifications portal
    ("notifications", "read"): [User.Role.STAFF, User.Role.ADMIN, User.Role.SUPER_ADMIN],
    ("notifications", "write"): [User.Role.ADMIN, User.Role.SUPER_ADMIN],
    # Settings portal
    ("settings", "read"): [User.Role.SUPER_ADMIN],
    ("settings", "write"): [User.Role.SUPER_ADMIN],
    # Files portal
    ("files", "read"): [User.Role.ADMIN, User.Role.SUPER_ADMIN],
    ("files", "write"): [User.Role.ADMIN, User.Role.SUPER_ADMIN],
    # Dashboard portal
    ("dashboard", "read"): [User.Role.ADMIN, User.Role.SUPER_ADMIN],
    # Auth portal (profile, etc.)
    ("auth", "read"): [User.Role.STAFF, User.Role.ADMIN, User.Role.SUPER_ADMIN],
    ("auth", "write"): [User.Role.STAFF, User.Role.ADMIN, User.Role.SUPER_ADMIN],
}


class HasPortalPermission(BasePermission):
    """
    Fine-grained portal-based permission class.

    Usage in views:
        permission_classes = [IsAuthenticated, HasPortalPermission]
        portal = "staff"  # set as class attribute on view

    Or dynamically via view's get_portal() method.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        portal = getattr(view, "portal", None)
        if not portal:
            return True  # No portal restriction

        action = self._get_action(request)
        allowed_roles = PORTAL_PERMISSIONS.get((portal, action), [])
        return request.user.role in allowed_roles

    def _get_action(self, request):
        """Determine read vs write action based on HTTP method."""
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return "read"
        return "write"
