import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.utils import timezone
from rest_framework.test import APIClient

from domains.accounts.models import LoginChallenge
from domains.contact.models import ContactMessage
from domains.media.models import MediaAsset
from domains.portfolio.models import PortfolioCategory, PortfolioProject
from domains.resume.models import Experience
from domains.site_content.models import SocialLink
from domains.site_content.social_links import normalize_social
from domains.skills.models import Skill


@pytest.mark.parametrize(
    ("platform", "raw", "display", "href"),
    [
        ("email", "editor@example.com", "editor@example.com", "mailto:editor@example.com"),
        ("telegram", "CTRLZ_Edits", "@CTRLZ_Edits", "https://t.me/CTRLZ_Edits"),
        ("telegram", "https://t.me/CTRLZ_Edits", "@CTRLZ_Edits", "https://t.me/CTRLZ_Edits"),
        ("instagram", "@ctrlz.edits", "@ctrlz.edits", "https://www.instagram.com/ctrlz.edits/"),
        ("instagram", "https://instagram.com/ctrlz.edits/", "@ctrlz.edits", "https://www.instagram.com/ctrlz.edits/"),
        ("youtube", "CTRLZ.Edits", "@CTRLZ.Edits", "https://www.youtube.com/@CTRLZ.Edits"),
        ("youtube", "https://www.youtube.com/@CTRLZ.Edits", "@CTRLZ.Edits", "https://www.youtube.com/@CTRLZ.Edits"),
    ],
)
def test_contact_social_normalization(platform, raw, display, href):
    assert normalize_social(platform, raw) == (display, href)


@pytest.mark.parametrize(
    ("platform", "raw"),
    [
        ("email", "not an email"),
        ("telegram", "https://evil.example/CTRLZ_Edits"),
        ("telegram", "https://t.me/short?start=unsafe"),
        ("instagram", "javascript:alert(1)"),
        ("youtube", "http://youtube.com/@CTRLZ.Edits"),
    ],
)
def test_contact_social_rejects_unsafe_or_invalid_links(platform, raw):
    with pytest.raises(ValueError):
        normalize_social(platform, raw)


def test_contact_channel_destinations_and_quoted_email_are_preserved_safely():
    for path in ("channel/UC_ExampleChannel", "c/ExampleChannel", "user/ExampleChannel"):
        assert normalize_social("youtube", f"https://youtube.com/{path}", "@ChannelDisplay") == (
            "@ChannelDisplay",
            f"https://www.youtube.com/{path}",
        )
    address, destination = normalize_social("email", '"project?subject=private"@example.com')
    assert address == '"project?subject=private"@example.com'
    assert "?" not in destination and "%3F" in destination


@pytest.mark.django_db
def test_education_admin_dates_images_visibility_and_validation(owner_client):
    from io import BytesIO

    from PIL import Image

    token = owner_client.cookies["csrftoken"].value
    anonymous = APIClient()
    image = BytesIO()
    Image.new("RGB", (40, 24), "red").save(image, format="PNG")
    asset = owner_client.post(
        "/api/v1/admin/media/",
        {"file": SimpleUploadedFile("university.png", image.getvalue(), content_type="image/png")},
        format="multipart",
        HTTP_X_CSRFTOKEN=token,
    ).json()["data"]
    assert anonymous.get(asset["url"]).status_code == 404
    payload = {
        "degree": "کارشناسی",
        "field": "گرافیک",
        "institution": "دانشگاه نمونه",
        "start_year": "۱۳۹۸",
        "end_year": "۱۴۰۲",
        "description": "آموزش روایت تصویری",
        "image_asset": asset["id"],
        "order": 4,
        "image_alt": "دانشگاه نمونه",
        "accent": "red",
        "visible": True,
    }
    created = owner_client.post("/api/v1/admin/education/", payload, format="json", HTTP_X_CSRFTOKEN=token)
    assert created.status_code == 201, created.content
    row = created.json()["data"]
    assert row["image_url"] == asset["url"]
    assert anonymous.get(asset["url"]).status_code == 200
    public = anonymous.get("/api/v1/resume/").json()["data"]["education"]
    assert public[0]["field"] == "گرافیک" and public[0]["start_year"] == "۱۳۹۸"
    endpoint = f"/api/v1/admin/education/{row['id']}/"
    assert owner_client.patch(endpoint, {"end_year": "۱۳۹۰"}, format="json", HTTP_X_CSRFTOKEN=token).status_code == 400
    current = owner_client.patch(endpoint, {"end_year": "", "is_current": True}, format="json", HTTP_X_CSRFTOKEN=token)
    assert current.status_code == 200 and current.json()["data"]["is_current"] is True
    assert (
        owner_client.patch(
            endpoint, {"image": "javascript:alert(1)"}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 400
    )
    owner_client.patch(endpoint, {"visible": False}, format="json", HTTP_X_CSRFTOKEN=token)
    assert anonymous.get("/api/v1/resume/").json()["data"]["education"] == []
    assert anonymous.get(asset["url"]).status_code == 404
    assert owner_client.delete(endpoint, HTTP_X_CSRFTOKEN=token).status_code == 204


@pytest.mark.django_db
def test_resume_hud_admin_media_order_and_public_visibility(owner_client, seeded):
    from io import BytesIO

    from PIL import Image

    token = owner_client.cookies["csrftoken"].value
    anonymous = APIClient()
    image = BytesIO()
    Image.new("RGB", (48, 30), "blue").save(image, format="PNG")
    asset = owner_client.post(
        "/api/v1/admin/media/",
        {"file": SimpleUploadedFile("experience.png", image.getvalue(), content_type="image/png")},
        format="multipart",
        HTTP_X_CSRFTOKEN=token,
    ).json()["data"]
    assert anonymous.get(asset["url"]).status_code == 404
    experience = owner_client.post(
        "/api/v1/admin/experience/",
        {
            "title": "New Editor Role",
            "company": "Studio",
            "start": "۱۴۰۰",
            "end": "",
            "is_current": True,
            "description": "A test role",
            "accent": "gold",
            "image_asset": asset["id"],
            "image_alt": "Editor at work",
            "order": 0,
            "visible": True,
        },
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert experience.status_code == 201, experience.content
    row = experience.json()["data"]
    assert row["image_url"] == asset["url"] and row["is_current"] is True
    assert anonymous.get(asset["url"]).status_code == 200
    public = anonymous.get("/api/v1/resume/").json()["data"]["experience"]
    assert any(item["id"] == row["id"] and item["image_alt"] == "Editor at work" for item in public)
    endpoint = f"/api/v1/admin/experience/{row['id']}/"
    assert (
        owner_client.patch(
            endpoint, {"image": "javascript:alert(1)"}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 400
    )
    assert owner_client.patch(endpoint, {"accent": "orange"}, format="json", HTTP_X_CSRFTOKEN=token).status_code == 400
    assert (
        owner_client.patch(endpoint, {"order": 7, "visible": False}, format="json", HTTP_X_CSRFTOKEN=token).status_code
        == 200
    )
    assert all(item["id"] != row["id"] for item in anonymous.get("/api/v1/resume/").json()["data"]["experience"])
    assert anonymous.get(asset["url"]).status_code == 404
    assert owner_client.delete(endpoint, HTTP_X_CSRFTOKEN=token).status_code == 204


@pytest.mark.django_db
def test_experience_editorial_details_reorder_and_public_visibility(owner_client):
    token = owner_client.cookies["csrftoken"].value
    endpoint = "/api/v1/admin/experience/"
    first = owner_client.post(
        endpoint,
        {
            "title": "Editor",
            "company": "Studio",
            "start": "2024",
            "start_date": "2024-01-01",
            "employment_type": "freelance",
            "workplace_type": "remote",
            "location": "Tehran",
            "responsibilities": ["Editing"],
            "achievements": ["Award"],
            "projects": ["Campaign"],
            "technologies": ["Resolve"],
            "links": [{"label": "Project", "url": "https://example.com/project"}],
            "translations": {"en": {"title": "Editor", "achievements": ["Award"]}},
            "visible": True,
        },
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert first.status_code == 201, first.content
    first_id = first.json()["data"]["id"]
    second = owner_client.post(
        endpoint,
        {"title": "Second", "start": "2023", "visible": True},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert second.status_code == 201, second.content
    second_id = second.json()["data"]["id"]
    public = APIClient().get("/api/v1/resume/").json()["data"]["experience"]
    assert [row["id"] for row in public] == [first_id, second_id]
    assert public[0]["technologies"] == ["Resolve"]
    assert APIClient().post(endpoint + "reorder/", {"ids": [second_id, first_id]}, format="json").status_code == 401
    moved = owner_client.post(
        endpoint + "reorder/", {"ids": [second_id, first_id]}, format="json", HTTP_X_CSRFTOKEN=token
    )
    assert moved.status_code == 200, moved.content
    public = APIClient().get("/api/v1/resume/").json()["data"]["experience"]
    assert [row["id"] for row in public] == [second_id, first_id]
    invalid = owner_client.patch(
        endpoint + f"{first_id}/",
        {"end_date": "2023-01-01"},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert invalid.status_code == 400
    unsafe = owner_client.patch(
        endpoint + f"{first_id}/",
        {"links": [{"label": "Unsafe", "url": "javascript:alert(1)"}]},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert unsafe.status_code == 400
    hidden = owner_client.patch(
        endpoint + f"{first_id}/",
        {"visible": False},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert hidden.status_code == 200
    assert all(row["id"] != first_id for row in APIClient().get("/api/v1/resume/").json()["data"]["experience"])


@pytest.mark.django_db
def test_resume_certificates_achievements_and_skill_labels(owner_client, seeded):
    from io import BytesIO

    from PIL import Image

    from domains.resume.models import Achievement, Certificate
    from domains.site_content.models import PageBlock

    token = owner_client.cookies["csrftoken"].value
    anonymous = APIClient()
    pdf = MediaAsset.objects.get(filename="resume-demo.pdf")
    certificate = owner_client.post(
        "/api/v1/admin/certificates/",
        {
            "title": "Course One",
            "issuer": "Demo provider",
            "year": "۱۴۰۵",
            "icon": "Pr",
            "certificate_asset": pdf.pk,
            "order": 0,
            "visible": True,
        },
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert certificate.status_code == 201, certificate.content
    cert_row = certificate.json()["data"]
    assert cert_row["certificate_url"] == f"/api/v1/media/{pdf.pk}/"
    assert anonymous.get(cert_row["certificate_url"]).status_code == 200
    cert_endpoint = f"/api/v1/admin/certificates/{cert_row['id']}/"
    image = BytesIO()
    Image.new("RGB", (32, 32), "red").save(image, format="PNG")
    wrong_image = owner_client.post(
        "/api/v1/admin/media/",
        {"file": SimpleUploadedFile("not-a-certificate.png", image.getvalue(), content_type="image/png")},
        format="multipart",
        HTTP_X_CSRFTOKEN=token,
    ).json()["data"]
    assert (
        owner_client.patch(
            cert_endpoint, {"certificate_asset": wrong_image["id"]}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 400
    )
    cleared = owner_client.patch(cert_endpoint, {"certificate_asset": None}, format="json", HTTP_X_CSRFTOKEN=token)
    assert cleared.status_code == 200 and cleared.json()["data"]["certificate_url"] == ""
    assert (
        owner_client.patch(cert_endpoint, {"visible": False}, format="json", HTTP_X_CSRFTOKEN=token).status_code == 200
    )
    assert Certificate.objects.filter(pk=cert_row["id"], visible=True).count() == 0
    assert all(item["id"] != cert_row["id"] for item in anonymous.get("/api/v1/resume/").json()["data"]["certificates"])
    assert owner_client.delete(cert_endpoint, HTTP_X_CSRFTOKEN=token).status_code == 204

    achievement = owner_client.post(
        "/api/v1/admin/achievements/",
        {
            "title": "Zero milestone",
            "value": "0",
            "numeric_value": 0,
            "prefix": "+",
            "suffix": "K",
            "icon": "star",
            "order": 0,
        },
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert achievement.status_code == 201, achievement.content
    achievement_row = achievement.json()["data"]
    assert achievement_row["numeric_value"] == 0 and achievement_row["prefix"] == "+"
    assert any(
        item["id"] == achievement_row["id"] and item["numeric_value"] == 0
        for item in anonymous.get("/api/v1/resume/").json()["data"]["achievements"]
    )
    assert (
        owner_client.delete(f"/api/v1/admin/achievements/{achievement_row['id']}/", HTTP_X_CSRFTOKEN=token).status_code
        == 204
    )
    assert not Achievement.objects.filter(pk=achievement_row["id"]).exists()

    skill = Skill.objects.filter(kind="software").first()
    assert skill is not None
    response = owner_client.patch(
        f"/api/v1/admin/skills/{skill.pk}/", {"level_label": "حرفه‌ای"}, format="json", HTTP_X_CSRFTOKEN=token
    )
    assert response.status_code == 200
    assert (
        next(item for item in anonymous.get("/api/v1/skills/").json()["data"] if item["id"] == skill.pk)["level_label"]
        == "حرفه‌ای"
    )
    block = PageBlock.objects.get(key="resume-about")
    block.body = "متن شخصی مدیر"
    block.save(update_fields=["body"])
    call_command("seed", verbosity=0)
    block.refresh_from_db()
    assert block.body == "متن شخصی مدیر"


@pytest.mark.django_db
def test_resume_about_block_uploads_and_public_media_visibility(owner_client, seeded):
    from io import BytesIO

    from PIL import Image

    from domains.site_content.models import PageBlock

    token = owner_client.cookies["csrftoken"].value
    anonymous = APIClient()
    image = BytesIO()
    Image.new("RGB", (32, 32), "blue").save(image, format="PNG")
    asset = owner_client.post(
        "/api/v1/admin/media/",
        {"file": SimpleUploadedFile("about.png", image.getvalue(), content_type="image/png")},
        format="multipart",
        HTTP_X_CSRFTOKEN=token,
    ).json()["data"]
    assert anonymous.get(asset["url"]).status_code == 404
    block = PageBlock.objects.get(key="resume-about")
    endpoint = f"/api/v1/admin/blocks/{block.pk}/"
    response = owner_client.patch(
        endpoint,
        {
            "subtitle": "زیرعنوان شخصی",
            "image_asset": asset["id"],
            "secondary_image_asset": asset["id"],
        },
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert response.status_code == 200, response.content
    row = next(item for item in anonymous.get("/api/v1/content/").json()["data"]["blocks"] if item["id"] == block.pk)
    assert row["subtitle"] == "زیرعنوان شخصی"
    assert row["image_url"] == asset["url"] and row["secondary_image_url"] == asset["url"]
    assert anonymous.get(asset["url"]).status_code == 200
    pdf = MediaAsset.objects.get(filename="resume-demo.pdf")
    assert (
        owner_client.patch(endpoint, {"image_asset": pdf.pk}, format="json", HTTP_X_CSRFTOKEN=token).status_code == 400
    )
    assert owner_client.patch(endpoint, {"visible": False}, format="json", HTTP_X_CSRFTOKEN=token).status_code == 200
    assert anonymous.get(asset["url"]).status_code == 404


@pytest.mark.django_db
def test_specialty_configuration_and_reference_seed_preserves_editorial_data(owner_client, seeded):
    from domains.site_content.models import PageBlock
    from domains.site_content.reference_defaults import seed_reference_defaults

    token = owner_client.cookies["csrftoken"].value
    grading = Skill.objects.get(title="اصلاح رنگ و گریدینگ")
    assert grading.variant == "color-grading" and grading.accent == "gold"
    response = owner_client.patch(
        f"/api/v1/admin/skills/{grading.pk}/",
        {"description": "متن سفارشی مدیر", "level": 73, "accent": "purple", "order": 31},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert response.status_code == 200
    seed_reference_defaults()
    grading.refresh_from_db()
    assert grading.level == 73 and grading.accent == "purple" and grading.description == "متن سفارشی مدیر"
    public = APIClient().get("/api/v1/skills/").json()["data"]
    assert next(item for item in public if item["id"] == grading.pk)["artwork_url"].endswith("grading-workstation.webp")
    assert (
        owner_client.patch(
            f"/api/v1/admin/skills/{grading.pk}/", {"level": 101}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 400
    )
    assert (
        owner_client.patch(
            f"/api/v1/admin/skills/{grading.pk}/", {"accent": "invalid"}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 400
    )
    block = PageBlock.objects.get(key="about-story")
    bad = owner_client.patch(
        f"/api/v1/admin/blocks/{block.pk}/",
        {"items": [{"title": "Bad", "image": "javascript:alert(1)"}]},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert bad.status_code == 400
    styles = PageBlock.objects.get(key="about-styles")
    styles.items[0]["image"] = "/assets/editorial-choice.webp"
    styles.save(update_fields=["items"])
    seed_reference_defaults()
    styles.refresh_from_db()
    assert styles.items[0]["image"] == "/assets/editorial-choice.webp"


@pytest.fixture
def seeded(db):
    call_command("seed", verbosity=0)
    return True


@pytest.fixture
def owner_client(db):
    get_user_model().objects.create_user(
        username="owner", password="A-Strong-Password-123!", role="owner", is_staff=True
    )
    client = APIClient(enforce_csrf_checks=True)
    csrf = client.get("/api/v1/auth/csrf/").json()["data"]["csrf_token"]
    response = client.post(
        "/api/v1/auth/login/",
        {"username": "owner", "password": "A-Strong-Password-123!", **login_challenge_answer(client)},
        format="json",
        HTTP_X_CSRFTOKEN=csrf,
    )
    assert response.status_code == 200, response.content
    return client


def login_challenge_answer(client):
    challenge = client.get("/api/v1/auth/challenge/").json()["data"]
    answer = (
        challenge["left"] + challenge["right"]
        if challenge["operator"] == "+"
        else challenge["left"] - challenge["right"]
    )
    assert 0 <= answer <= 100
    return {"challenge_id": challenge["challenge_id"], "challenge_answer": answer}


def assert_contract(response, success=True):
    body = response.json()
    assert set(body) == {"success", "message", "data", "error", "meta"}
    assert body["success"] is success
    assert "request_id" in body["meta"]
    return body


@pytest.mark.django_db
def test_seed_portfolio_listing_filter_search_detail_pagination(seeded):
    client = APIClient()
    listing = assert_contract(client.get("/api/v1/projects/?page_size=3"))
    assert len(listing["data"]) == 3
    assert listing["meta"]["pagination"]["total_items"] == 10
    assert listing["meta"]["pagination"]["has_next"] is True
    assert all(
        x["category_slug"] == "cinematic"
        for x in assert_contract(client.get("/api/v1/projects/?category=cinematic"))["data"]
    )
    assert assert_contract(client.get("/api/v1/projects/?search=قهرمان"))["data"][0]["slug"] == "project-01"
    detail = assert_contract(client.get("/api/v1/projects/project-01/"))["data"]
    assert detail["title"] == "سفر قهرمان" and "related" in detail
    assert_contract(client.get("/api/v1/projects/does-not-exist/"), False)


@pytest.mark.django_db
def test_contact_success_validation_spam_and_rate_limit():
    client = APIClient()
    payload = {
        "name": "Ali Reza",
        "email": "ali@example.com",
        "subject": "Editing job",
        "message": "Please edit our short film.",
    }
    response = client.post("/api/v1/contact/", payload, format="json")
    assert response.status_code == 201
    assert_contract(response)
    assert ContactMessage.objects.count() == 1
    bad = client.post("/api/v1/contact/", {**payload, "message": "short"}, format="json")
    assert bad.status_code == 400
    assert assert_contract(bad, False)["error"]["code"] == "VALIDATION_ERROR"
    spam = client.post("/api/v1/contact/", {**payload, "website": "bot"}, format="json")
    assert spam.status_code == 400
    for _ in range(2):
        client.post("/api/v1/contact/", payload, format="json")
    limited = client.post("/api/v1/contact/", payload, format="json")
    assert limited.status_code == 429
    assert assert_contract(limited, False)["error"]["code"] == "RATE_LIMITED"


@pytest.mark.django_db
def test_contact_social_admin_edits_propagate_to_public_content(owner_client, seeded):
    token = owner_client.cookies["csrftoken"].value
    public = APIClient()
    telegram = SocialLink.objects.get(platform="telegram")
    endpoint = f"/api/v1/admin/socials/{telegram.pk}/"
    changed = owner_client.patch(
        endpoint,
        {"handle": "New_CTRLZ", "label": "پیام در تلگرام", "description": "پیام سریع", "order": 8},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert changed.status_code == 200, changed.content
    matching = owner_client.get("/api/v1/admin/socials/", {"search": "پیام در تلگرام"}).json()["data"]
    assert [entry["id"] for entry in matching] == [telegram.pk]
    telegram.refresh_from_db()
    assert telegram.url == "https://t.me/New_CTRLZ"
    item = next(x for x in public.get("/api/v1/content/").json()["data"]["socials"] if x["id"] == telegram.pk)
    assert (item["display_value"], item["href"], item["label"], item["order"]) == (
        "@New_CTRLZ",
        "https://t.me/New_CTRLZ",
        "پیام در تلگرام",
        8,
    )
    changed_url = owner_client.patch(
        endpoint, {"url": "https://t.me/Another_CTRLZ"}, format="json", HTTP_X_CSRFTOKEN=token
    )
    assert changed_url.status_code == 200
    assert changed_url.json()["data"]["handle"] == "@Another_CTRLZ"
    assert (
        owner_client.patch(
            endpoint, {"url": "https://evil.example/unsafe"}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 400
    )
    assert owner_client.patch(endpoint, {"visible": False}, format="json", HTTP_X_CSRFTOKEN=token).status_code == 200
    assert telegram.pk not in [x["id"] for x in public.get("/api/v1/content/").json()["data"]["socials"]]
    email = SocialLink.objects.get(platform="email")
    email_change = owner_client.patch(
        f"/api/v1/admin/socials/{email.pk}/",
        {"handle": "portfolio@example.com"},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert email_change.status_code == 200
    assert email_change.json()["data"]["href"] == "mailto:portfolio@example.com"


@pytest.mark.django_db
def test_contact_form_enforces_subject_and_persists_timestamps():
    client = APIClient()
    payload = {
        "name": "Test Editor",
        "email": "test@example.com",
        "subject": "Hi",
        "message": "A detailed project request.",
    }
    short = client.post("/api/v1/contact/", payload, format="json", REMOTE_ADDR="198.51.100.45")
    assert short.status_code == 400
    payload["subject"] = "Video editing"
    sent = client.post("/api/v1/contact/", payload, format="json", REMOTE_ADDR="198.51.100.45")
    assert sent.status_code == 201
    saved = ContactMessage.objects.get(pk=sent.json()["data"]["id"])
    assert saved.name == "Test Editor" and saved.status == "unread"
    assert saved.created_at and saved.updated_at


@pytest.mark.django_db
def test_auth_csrf_unauthorized_and_role_enforcement(owner_client):
    anon = APIClient(enforce_csrf_checks=True)
    response = anon.get("/api/v1/admin/projects/")
    assert response.status_code == 401
    assert assert_contract(response, False)["error"]["code"] == "AUTH_REQUIRED"
    bad_login = anon.post("/api/v1/auth/login/", {"username": "owner", "password": "wrong"}, format="json")
    assert bad_login.status_code == 403  # Anonymous unsafe request must carry a CSRF token.
    forbidden_csrf = owner_client.post(
        "/api/v1/admin/categories/", {"title": "Test", "slug": "test"}, format="json", HTTP_X_CSRFTOKEN="wrong"
    )
    assert forbidden_csrf.status_code == 403
    get_user_model().objects.create_user(
        username="viewer", password="A-Strong-Password-123!", role="viewer", is_staff=True
    )
    view_client = APIClient(enforce_csrf_checks=True)
    token = view_client.get("/api/v1/auth/csrf/").json()["data"]["csrf_token"]
    view_client.post(
        "/api/v1/auth/login/",
        {"username": "viewer", "password": "A-Strong-Password-123!", **login_challenge_answer(view_client)},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    forbidden = view_client.post(
        "/api/v1/admin/categories/",
        {"title": "Test", "slug": "test"},
        format="json",
        HTTP_X_CSRFTOKEN=view_client.cookies["csrftoken"].value,
    )
    assert forbidden.status_code == 403
    assert assert_contract(forbidden, False)["error"]["code"] == "FORBIDDEN"


@pytest.mark.django_db
def test_login_requires_fresh_single_use_math_challenge():
    get_user_model().objects.create_user(
        username="math-owner", password="A-Strong-Password-123!", role="owner", is_staff=True
    )
    client = APIClient(enforce_csrf_checks=True)
    csrf = client.get("/api/v1/auth/csrf/").json()["data"]["csrf_token"]
    credentials = {"username": "math-owner", "password": "A-Strong-Password-123!"}
    missing = client.post("/api/v1/auth/login/", credentials, format="json", HTTP_X_CSRFTOKEN=csrf)
    assert missing.status_code == 400
    challenge = login_challenge_answer(client)
    wrong = client.post(
        "/api/v1/auth/login/",
        {**credentials, **challenge, "challenge_answer": (challenge["challenge_answer"] + 1) % 101},
        format="json",
        HTTP_X_CSRFTOKEN=csrf,
    )
    assert wrong.status_code == 400
    replay = client.post("/api/v1/auth/login/", {**credentials, **challenge}, format="json", HTTP_X_CSRFTOKEN=csrf)
    assert replay.status_code == 400
    expired = login_challenge_answer(client)
    LoginChallenge.objects.filter(key=expired["challenge_id"]).update(expires_at=timezone.now())
    assert (
        client.post("/api/v1/auth/login/", {**credentials, **expired}, format="json", HTTP_X_CSRFTOKEN=csrf).status_code
        == 400
    )
    valid = login_challenge_answer(client)
    success = client.post("/api/v1/auth/login/", {**credentials, **valid}, format="json", HTTP_X_CSRFTOKEN=csrf)
    assert success.status_code == 200
    assert LoginChallenge.objects.get(key=valid["challenge_id"]).used_at is not None


@pytest.mark.django_db
def test_admin_project_skill_resume_crud_and_messages(owner_client, seeded):
    token = owner_client.cookies["csrftoken"].value
    category = PortfolioCategory.objects.first()
    payload = {
        "title": "New edit",
        "slug": "new-edit",
        "category": category.pk,
        "status": "draft",
        "tools": ["Premiere Pro"],
        "tags": ["demo"],
    }
    created = owner_client.post("/api/v1/admin/projects/", payload, format="json", HTTP_X_CSRFTOKEN=token)
    assert created.status_code == 201, created.content
    pk = assert_contract(created)["data"]["id"]
    assert (
        owner_client.patch(
            f"/api/v1/admin/projects/{pk}/", {"status": "published"}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 200
    )
    assert PortfolioProject.objects.get(pk=pk).status == "published"
    assert owner_client.delete(f"/api/v1/admin/projects/{pk}/", HTTP_X_CSRFTOKEN=token).status_code == 204
    skill = owner_client.post(
        "/api/v1/admin/skills/",
        {"title": "Sound Design", "level": 90, "kind": "creative"},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert skill.status_code == 201
    skill_pk = skill.json()["data"]["id"]
    assert (
        owner_client.patch(
            f"/api/v1/admin/skills/{skill_pk}/", {"level": 92}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 200
    )
    assert Skill.objects.get(pk=skill_pk).level == 92
    assert owner_client.delete(f"/api/v1/admin/skills/{skill_pk}/", HTTP_X_CSRFTOKEN=token).status_code == 204
    exp = owner_client.post(
        "/api/v1/admin/experience/", {"title": "Editor", "start": "2026"}, format="json", HTTP_X_CSRFTOKEN=token
    )
    assert exp.status_code == 201
    exp_pk = exp.json()["data"]["id"]
    assert (
        owner_client.patch(
            f"/api/v1/admin/experience/{exp_pk}/", {"end": "Now"}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 200
    )
    assert Experience.objects.get(pk=exp_pk).end == "Now"
    assert owner_client.delete(f"/api/v1/admin/experience/{exp_pk}/", HTTP_X_CSRFTOKEN=token).status_code == 204
    message = ContactMessage.objects.create(
        name="Ali", email="ali@example.com", subject="Hello", message="Long enough message"
    )
    assert (
        owner_client.patch(
            f"/api/v1/admin/messages/{message.pk}/", {"status": "read"}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 200
    )
    assert (
        owner_client.patch(
            f"/api/v1/admin/messages/{message.pk}/", {"status": "archived"}, format="json", HTTP_X_CSRFTOKEN=token
        ).status_code
        == 200
    )
    assert ContactMessage.objects.get(pk=message.pk).status == "archived"


@pytest.mark.django_db
def test_media_upload_validation_and_404(owner_client):
    token = owner_client.cookies["csrftoken"].value
    fake = SimpleUploadedFile("fake.png", b"not-a-png", content_type="image/png")
    response = owner_client.post("/api/v1/admin/media/", {"file": fake}, format="multipart", HTTP_X_CSRFTOKEN=token)
    assert response.status_code == 400
    assert MediaAsset.objects.count() == 0
    assert_contract(response, False)
    bad = owner_client.get("/api/v1/media/99999/")
    assert bad.status_code == 404
    assert_contract(bad, False)


@pytest.mark.django_db
def test_public_content_and_health(seeded):
    client = APIClient()
    content = assert_contract(client.get("/api/v1/content/"))["data"]
    assert len(content["heroes"]) == 6
    assert len(assert_contract(client.get("/api/v1/skills/"))["data"]) == 13
    resume = assert_contract(client.get("/api/v1/resume/"))["data"]
    assert len(resume["experience"]) == 4
    assert resume["files"] == []  # Legacy language is unknown until explicitly assigned.
    assert client.get("/api/v1/resume/fa/download/").status_code == 404
    assert assert_contract(client.get("/api/v1/health/"))["data"]["status"] == "ok"


@pytest.mark.django_db
def test_valid_media_upload_private_public_pdf_and_validation(
    owner_client, tmp_path, settings, django_capture_on_commit_callbacks
):
    import io

    from PIL import Image

    from domains.resume.models import ResumeFile

    settings.MEDIA_ROOT = tmp_path
    token = owner_client.cookies["csrftoken"].value
    image = io.BytesIO()
    Image.new("RGB", (32, 20), (20, 60, 150)).save(image, format="PNG")
    upload = owner_client.post(
        "/api/v1/admin/media/",
        {"file": SimpleUploadedFile("sample.png", image.getvalue(), content_type="image/png"), "alt": "Sample"},
        format="multipart",
        HTTP_X_CSRFTOKEN=token,
    )
    assert upload.status_code == 201, upload.content
    asset_id = upload.json()["data"]["id"]
    assert upload.json()["data"]["width"] == 32
    anon = APIClient()
    assert anon.get(f"/api/v1/media/{asset_id}/").status_code == 404
    category = PortfolioCategory.objects.create(title="Test", slug="test-media")
    project = PortfolioProject.objects.create(
        title="Media test", slug="media-test", category=category, thumbnail_asset_id=asset_id, status="published"
    )
    public = anon.get(f"/api/v1/media/{asset_id}/")
    assert public.status_code == 200 and public["Content-Type"] == "image/png"
    assert b"".join(public.streaming_content) == image.getvalue()
    category.visible = False
    category.save()
    assert anon.get(f"/api/v1/media/{asset_id}/").status_code == 404
    mismatch = owner_client.post(
        "/api/v1/admin/media/",
        {"file": SimpleUploadedFile("bad.jpg", image.getvalue(), content_type="image/jpeg")},
        format="multipart",
        HTTP_X_CSRFTOKEN=token,
    )
    assert mismatch.status_code == 400
    pdf = owner_client.post(
        "/api/v1/admin/media/",
        {
            "file": SimpleUploadedFile(
                "resume.pdf", b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF", content_type="application/pdf"
            )
        },
        format="multipart",
        HTTP_X_CSRFTOKEN=token,
    )
    assert pdf.status_code == 201
    pdf_id = pdf.json()["data"]["id"]
    resume = owner_client.post(
        "/api/v1/admin/resume-files/",
        {"title": "Resume", "asset": pdf_id, "language": "en"},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )
    assert resume.status_code == 201
    assert anon.get(f"/api/v1/media/{pdf_id}/").status_code == 200
    wrong_pdf = owner_client.post(
        "/api/v1/admin/resume-files/", {"title": "Wrong", "asset": asset_id}, format="json", HTTP_X_CSRFTOKEN=token
    )
    assert wrong_pdf.status_code == 400
    image_asset = MediaAsset.objects.get(pk=asset_id)
    storage, key = image_asset.file.storage, image_asset.file.name
    assert owner_client.delete(f"/api/v1/admin/media/{asset_id}/", HTTP_X_CSRFTOKEN=token).status_code == 400
    project.thumbnail_asset = None
    project.save()
    with django_capture_on_commit_callbacks(execute=True):
        assert owner_client.delete(f"/api/v1/admin/media/{asset_id}/", HTTP_X_CSRFTOKEN=token).status_code == 204
    assert not storage.exists(key)
    project.refresh_from_db()
    assert project.thumbnail_asset is None
    assert ResumeFile.objects.count() == 1


@pytest.mark.django_db
def test_refresh_rotation_logout_and_password_change_revoke(owner_client):
    from domains.accounts.models import User

    token = owner_client.cookies["csrftoken"].value
    old_refresh = owner_client.cookies["ctrlz_refresh"].value
    refresh = owner_client.post("/api/v1/auth/refresh/", HTTP_X_CSRFTOKEN=token)
    assert refresh.status_code == 200
    assert owner_client.cookies["ctrlz_refresh"].value != old_refresh
    replay = APIClient(enforce_csrf_checks=True)
    replay.cookies["ctrlz_refresh"] = old_refresh
    replay.cookies["csrftoken"] = token
    assert replay.post("/api/v1/auth/refresh/", HTTP_X_CSRFTOKEN=token).status_code == 401
    user = User.objects.get(username="owner")
    user.set_password("Another-Strong-Password-321!")
    user.save()
    assert owner_client.get("/api/v1/auth/me/").status_code == 401
    assert owner_client.post("/api/v1/auth/refresh/", HTTP_X_CSRFTOKEN=token).status_code == 401
    assert owner_client.post("/api/v1/auth/logout/", HTTP_X_CSRFTOKEN=token).status_code == 200
    assert owner_client.get("/api/v1/auth/me/").status_code == 401


@pytest.mark.django_db
def test_published_video_supports_byte_ranges(owner_client, tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    token = owner_client.cookies["csrftoken"].value
    video = (settings.BASE_DIR / "seed_assets" / "demo-preview-30.webm").read_bytes()
    upload = owner_client.post(
        "/api/v1/admin/media/",
        {"file": SimpleUploadedFile("demo.webm", video, content_type="video/webm")},
        format="multipart",
        HTTP_X_CSRFTOKEN=token,
    )
    assert upload.status_code == 201
    asset_id = upload.json()["data"]["id"]
    category = PortfolioCategory.objects.create(title="Video", slug="video")
    PortfolioProject.objects.create(
        title="Video demo", slug="video-demo", category=category, video_asset_id=asset_id, status="published"
    )
    anon = APIClient()
    partial = anon.get(f"/api/v1/media/{asset_id}/", HTTP_RANGE="bytes=4-13")
    assert partial.status_code == 206
    assert partial["Content-Range"] == f"bytes 4-13/{len(video)}"
    assert partial["Content-Length"] == "10"
    assert b"".join(partial.streaming_content) == video[4:14]
    suffix = anon.get(f"/api/v1/media/{asset_id}/", HTTP_RANGE="bytes=-5")
    assert suffix.status_code == 206
    assert b"".join(suffix.streaming_content) == video[-5:]
    invalid = anon.get(f"/api/v1/media/{asset_id}/", HTTP_RANGE=f"bytes={len(video) + 1}-")
    assert invalid.status_code == 416
    assert invalid["Content-Range"] == f"bytes */{len(video)}"


@pytest.mark.django_db
def test_invalid_refreshes_do_not_consume_login_attempts(monkeypatch):
    from core.throttling import SharedRateThrottle

    monkeypatch.setattr(
        SharedRateThrottle, "THROTTLE_RATES", {"anon": "3000/hour", "login": "1/hour", "refresh": "2/hour"}
    )
    get_user_model().objects.create_user(
        username="session-user", password="A-Strong-Password-123!", role="owner", is_staff=True
    )
    client = APIClient(enforce_csrf_checks=True)
    csrf = client.get("/api/v1/auth/csrf/").json()["data"]["csrf_token"]
    assert client.post("/api/v1/auth/refresh/", HTTP_X_CSRFTOKEN=csrf).status_code == 401
    assert client.post("/api/v1/auth/refresh/", HTTP_X_CSRFTOKEN=csrf).status_code == 401
    assert client.post("/api/v1/auth/refresh/", HTTP_X_CSRFTOKEN=csrf).status_code == 429
    login = client.post(
        "/api/v1/auth/login/",
        {"username": "session-user", "password": "A-Strong-Password-123!", **login_challenge_answer(client)},
        format="json",
        HTTP_X_CSRFTOKEN=csrf,
    )
    assert login.status_code == 200
