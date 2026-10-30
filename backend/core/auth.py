from django.conf import settings
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw = request.COOKIES.get("ctrlz_access")
        if not raw:
            return None
        token = self.get_validated_token(raw)
        user = self.get_user(token)
        if request.method not in SAFE_METHODS:
            SessionAuthentication().enforce_csrf(request)
        return user, token

    def authenticate_header(self, request):
        return "Cookie"


class EditorialPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_staff
            and (request.method in SAFE_METHODS or user.role in ("owner", "editor") or user.is_superuser)
        )


class OwnerPermission(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user.is_authenticated
            and request.user.is_staff
            and (request.user.role == "owner" or request.user.is_superuser)
        )


def set_auth_cookies(response, access, refresh):
    response.set_cookie(
        "ctrlz_access", str(access), max_age=900, httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/api/"
    )
    response.set_cookie(
        "ctrlz_refresh",
        str(refresh),
        max_age=28800,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        path="/api/v1/auth/",
    )
    return response
