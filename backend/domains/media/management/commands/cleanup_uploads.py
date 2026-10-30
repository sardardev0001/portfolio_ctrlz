from django.core.management.base import BaseCommand

from domains.media.cleanup import cleanup_expired_uploads


class Command(BaseCommand):
    help = "Remove unlinked managed uploads older than 24 hours; preserves all legacy/library assets."

    def handle(self, *args, **options):
        cleanup_expired_uploads(limit=1000)
        self.stdout.write("Managed orphan cleanup completed.")
