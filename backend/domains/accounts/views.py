import secrets
from datetime import timedelta

from django.contrib.auth import authenticate
from django.middleware.csrf import get_token, rotate_token
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.utils import get_md5_hash_password

from core.auth import EditorialPermission, set_auth_cookies
from core.throttling import SharedRateThrottle
from core.upload_auth import UPLOAD_TICKET_MAX_AGE, issue_upload_ticket
from domains.accounts.models import LoginChallenge, User
from domains.audit.models import AdminAuditLog


def user_data(user):
    return {"id": user.pk, "username": user.username, "role": user.role, "is_superuser": user.is_superuser}


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=256, write_only=True)
    challenge_id = serializers.CharField(max_length=64, write_only=True)
    challenge_answer = serializers.IntegerField(min_value=0, max_value=100, write_only=True)


class LoginChallengeView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        now = timezone.now()
        LoginChallenge.objects.filter(expires_at__lte=now).delete()
        if secrets.randbelow(2):
            left = secrets.randbelow(100)
            right = secrets.randbelow(101 - left)
            operator = "+"
            answer = left + right
        else:
            left = secrets.randbelow(101)
            right = secrets.randbelow(left + 1)
            operator = "−"
            answer = left - right
        key = secrets.token_urlsafe(32)
        LoginChallenge.objects.create(key=key, answer=answer, expires_at=now + timedelta(minutes=5))
        return Response(
            {"challenge_id": key, "left": left, "right": right, "operator": operator},
            headers={"Cache-Control": "no-store"},
        )


class CsrfView(APIView):
    authentication_classes = []

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        return Response({"csrf_token": get_token(request)})


class UploadTicketView(APIView):
    permission_classes = [EditorialPermission]

    @extend_schema(request=None, responses=OpenApiTypes.OBJECT)
    def post(self, request):
        return Response(
            {
                "ticket": issue_upload_ticket(request.user, request.COOKIES.get("ctrlz_access", "")),
                "expires_in": UPLOAD_TICKET_MAX_AGE,
            },
            headers={"Cache-Control": "no-store"},
        )


class LoginView(APIView):
    def get_authenticate_header(self, request):
        return "Cookie"

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [SharedRateThrottle]
    throttle_scope = "login"

    @extend_schema(request=LoginSerializer, responses=OpenApiTypes.OBJECT)
    def post(self, request):
        SessionAuthentication().enforce_csrf(request)
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        now = timezone.now()
        challenge = LoginChallenge.objects.filter(key=values["challenge_id"], expires_at__gt=now).first()
        if (
            not challenge
            or LoginChallenge.objects.filter(key=challenge.key, used_at__isnull=True, expires_at__gt=now).update(
                used_at=now
            )
            != 1
        ):
            raise serializers.ValidationError({"challenge_answer": "The security question expired. Request a new one."})
        if challenge.answer != values["challenge_answer"]:
            raise serializers.ValidationError({"challenge_answer": "The security answer is incorrect."})
        user = authenticate(request, username=values["username"], password=values["password"])
        if not user or not user.is_staff or not user.is_active:
            raise AuthenticationFailed("Invalid credentials.")
        rotate_token(request)
        token = RefreshToken.for_user(user)
        AdminAuditLog.objects.create(actor=user, action="login", entity="accounts.User", entity_id=str(user.pk))
        return set_auth_cookies(Response(user_data(user)), token.access_token, token)


class RefreshView(APIView):
    def get_authenticate_header(self, request):
        return "Cookie"

    authentication_classes = []
    throttle_classes = [SharedRateThrottle]
    throttle_scope = "refresh"

    @extend_schema(request=None, responses=OpenApiTypes.OBJECT)
    def post(self, request):
        SessionAuthentication().enforce_csrf(request)
        try:
            token = RefreshToken(request.COOKIES.get("ctrlz_refresh", ""))
            user = User.objects.get(pk=token["user_id"], is_active=True, is_staff=True)
            if token.get("hash_password") != get_md5_hash_password(user.password):
                raise AuthenticationFailed("Session expired.")
            token.blacklist()
            fresh = RefreshToken.for_user(user)
        except (TokenError, User.DoesNotExist) as exc:
            raise AuthenticationFailed("Session expired.") from exc
        return set_auth_cookies(Response(user_data(user)), fresh.access_token, fresh)


class MeView(APIView):
    permission_classes = [EditorialPermission]

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        return Response(user_data(request.user))


class LogoutView(APIView):
    authentication_classes = []

    @extend_schema(request=None, responses=OpenApiTypes.OBJECT)
    def post(self, request):
        SessionAuthentication().enforce_csrf(request)
        raw = request.COOKIES.get("ctrlz_refresh")
        if raw:
            try:
                RefreshToken(raw).blacklist()
            except TokenError:
                pass
        response = Response({"logged_out": True})
        response.delete_cookie("ctrlz_access", path="/api/", samesite="Lax")
        response.delete_cookie("ctrlz_refresh", path="/api/v1/auth/", samesite="Lax")
        return response
