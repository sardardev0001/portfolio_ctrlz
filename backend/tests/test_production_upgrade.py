import os
import secrets
import subprocess
import sys
from pathlib import Path

import pytest

from core.serializers import GallerySerializer, PageBlockSerializer, ProjectSerializer
from domains.portfolio.models import PortfolioCategory, PortfolioProject
from domains.site_content.models import PageBlock


@pytest.mark.django_db
def test_locale_overrides_preserve_identifiers_and_require_text():
    category = PortfolioCategory.objects.create(title="Cinema", slug="cinematic")
    project = PortfolioProject.objects.create(title="Original", slug="original", category=category)
    serializer = ProjectSerializer(project, data={"translations": {"en": {"title": "English title"}}}, partial=True)
    assert serializer.is_valid(), serializer.errors
    serializer.save()
    assert ProjectSerializer(project).data["translations"]["en"]["title"] == "English title"
    for payload in [{"en": {"slug": "changed"}}, {"en": {"visible": True}}, {"en": {"title": []}}, []]:
        invalid = ProjectSerializer(project, data={"translations": payload}, partial=True)
        assert not invalid.is_valid()


@pytest.mark.django_db
def test_translated_style_items_cannot_override_destinations():
    block = PageBlock.objects.create(key="about-styles", items=[{"title": "Cinema", "category_slug": "cinematic"}])
    serializer = PageBlockSerializer(
        block, data={"translations": {"en": {"items": [{"title": "Cinematic"}]}}}, partial=True
    )
    assert serializer.is_valid(), serializer.errors
    invalid = PageBlockSerializer(
        block, data={"translations": {"en": {"items": [{"image": "javascript:x"}]}}}, partial=True
    )
    assert not invalid.is_valid()
    gallery = GallerySerializer(data={"translations": {"en": {"url": "javascript:bad"}}}, partial=True)
    assert not gallery.is_valid()


def test_production_requires_a_strong_environment_secret():
    environment = {**os.environ, "DEBUG": "false", "POSTGRES_HOST": "", "S3_ENDPOINT_URL": ""}
    for secret, accepted in [("short", False), ("a" * 64, False), (secrets.token_urlsafe(48), True)]:
        result = subprocess.run(
            [sys.executable, "-c", "from config import settings"],
            cwd=Path(__file__).resolve().parents[1],
            env={**environment, "DJANGO_SECRET_KEY": secret},
            capture_output=True,
            check=False,
        )
        assert (result.returncode == 0) is accepted
