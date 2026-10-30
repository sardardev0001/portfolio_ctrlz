from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    role = models.CharField(
        max_length=12, choices=[("owner", "Owner"), ("editor", "Editor"), ("viewer", "Viewer")], default="editor"
    )


class RequestWindow(models.Model):
    key = models.CharField(max_length=64, primary_key=True)
    count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(db_index=True)


class LoginChallenge(models.Model):
    key = models.CharField(max_length=64, primary_key=True)
    answer = models.PositiveSmallIntegerField()
    expires_at = models.DateTimeField(db_index=True)
    used_at = models.DateTimeField(null=True, blank=True)
