"""
Management command to create the default SuperAdmin.
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

User = get_user_model()


class Command(BaseCommand):
    help = "Create the default SuperAdmin account"

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            default="admin@WCBTcollege.com",
            help="SuperAdmin email (default: admin@WCBTcollege.com)",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="Admin@1234",
            help="SuperAdmin password (default: Admin@1234)",
        )
        parser.add_argument(
            "--first-name",
            type=str,
            default="Super",
            help="First name (default: Super)",
        )
        parser.add_argument(
            "--last-name",
            type=str,
            default="Admin",
            help="Last name (default: Admin)",
        )
        parser.add_argument(
            "--username",
            type=str,
            default="superadmin",
            help="Username (default: superadmin)",
        )

    def handle(self, *args, **options):
        email = options["email"]
        password = options["password"]
        first_name = options["first_name"]
        last_name = options["last_name"]
        username = options["username"]

        if User.objects.filter(email=email).exists():
            raise CommandError(f"User with email '{email}' already exists.")

        user = User.objects.create_superuser(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            username=username,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"SuperAdmin created successfully!\n"
                f"  Email:    {user.email}\n"
                f"  Username: {user.username}\n"
                f"  Name:     {user.full_name}\n"
                f"  Role:     {user.role}"
            )
        )
