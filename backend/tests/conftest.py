import pytest


@pytest.fixture(autouse=True)
def isolated_uploads(settings, tmp_path):
    """Tests never read or write the developer's real uploaded media."""
    settings.MEDIA_ROOT = tmp_path / "media"
    settings.STORAGES = {
        "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    }
