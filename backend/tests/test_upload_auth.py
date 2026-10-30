from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.fixture
def authenticated(db):
    user = get_user_model().objects.create_user(
        username="upload-grant", password="QA-Only-Strong-Password-123!", role="owner", is_staff=True
    )
    client = APIClient(enforce_csrf_checks=True)
    client.cookies["ctrlz_access"] = str(RefreshToken.for_user(user).access_token)
    csrf = client.get("/api/v1/auth/csrf/").json()["data"]["csrf_token"]
    client.credentials(HTTP_X_CSRFTOKEN=csrf)
    return user, client


def ticket(client):
    response = client.post("/api/v1/auth/upload-ticket/")
    assert response.status_code == 200, response.content
    return response.json()["data"]["ticket"]


def upload(client, grant):
    return client.post(
        "/api/v1/admin/media/",
        {"file": SimpleUploadedFile("small.pdf", b"%PDF-1.4\nQA", content_type="application/pdf")},
        format="multipart",
        HTTP_X_CTRLZ_UPLOAD_TICKET=grant,
    )


def test_upload_can_finish_after_access_expiry_but_other_apis_cannot(authenticated):
    _, client = authenticated
    grant = ticket(client)
    with patch("rest_framework_simplejwt.tokens.AccessToken.check_exp", side_effect=TokenError("expired")):
        assert client.get("/api/v1/auth/me/", HTTP_X_CTRLZ_UPLOAD_TICKET=grant).status_code == 401
        assert upload(client, grant).status_code == 201


@pytest.mark.parametrize("change", ["password", "role", "session", "expired", "forged"])
def test_revoked_or_invalid_upload_grant_rejected(authenticated, change):
    user, client = authenticated
    grant = ticket(client)
    if change == "password":
        user.set_password("Another-QA-Only-Password-123!")
        user.save()
    elif change == "role":
        user.role = "viewer"
        user.save()
    elif change == "session":
        client.cookies["ctrlz_access"] = "another-session"
    elif change == "forged":
        grant = "invalid-signed-value"
    if change == "expired":
        with patch("core.upload_auth.UPLOAD_TICKET_MAX_AGE", -1):
            assert upload(client, grant).status_code == 401
    else:
        assert upload(client, grant).status_code == 401


def test_upload_grant_preserves_csrf_and_editorial_permissions(authenticated):
    user, client = authenticated
    grant = ticket(client)
    client.credentials()
    assert upload(client, grant).status_code == 403
    user.role = "viewer"
    user.save()
    csrf = client.get("/api/v1/auth/csrf/").json()["data"]["csrf_token"]
    client.credentials(HTTP_X_CSRFTOKEN=csrf)
    assert client.post("/api/v1/auth/upload-ticket/").status_code == 403
