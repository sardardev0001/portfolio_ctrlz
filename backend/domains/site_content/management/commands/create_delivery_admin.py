import getpass
import os

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create an explicit local/staging owner without changing existing accounts or logging passwords."

    def add_arguments(self, parser):
        parser.add_argument("--username", required=True)

    def handle(self, *args, **options):
        User = get_user_model()
        username = options["username"]
        if User.objects.filter(username=username).exists():
            raise CommandError(
                "Account already exists; no password changed. Use changepassword interactively if authorized."
            )
        password = os.environ.get("CTRLZ_BOOTSTRAP_PASSWORD") or getpass.getpass("Initial password (hidden): ")
        try:
            validate_password(password)
        except Exception as exc:
            raise CommandError("Password does not meet the configured policy.") from exc
        User.objects.create_user(username=username, password=password, is_staff=True, is_superuser=True, role="owner")
        self.stdout.write(self.style.SUCCESS(f"Created owner: {username}. No existing account was changed."))
