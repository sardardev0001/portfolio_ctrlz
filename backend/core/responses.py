import math

from rest_framework import exceptions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from core.error_codes import ErrorCode


def envelope(data=None, *, message="Operation completed successfully.", error=None, meta=None):
    return {
        "success": error is None,
        "message": message,
        "data": data if error is None else None,
        "error": error,
        "meta": meta or {},
    }


class EnvelopeRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        context = renderer_context or {}
        response = context.get("response")
        request = context.get("request")
        if not isinstance(data, dict) or "success" not in data:
            if response and response.status_code >= 400:
                data = envelope(
                    error={"code": ErrorCode.REQUEST_FAILED, "details": data},
                    message="The request could not be completed.",
                )
            else:
                data = envelope(data)
        data.setdefault("meta", {})["request_id"] = getattr(request, "request_id", "")
        return super().render(data, accepted_media_type, renderer_context)


def exception_handler(exc, context):
    from rest_framework.views import exception_handler as drf_exception_handler

    response = drf_exception_handler(exc, context)
    codes = {
        exceptions.ValidationError: ErrorCode.VALIDATION_ERROR,
        exceptions.NotAuthenticated: ErrorCode.AUTH_REQUIRED,
        exceptions.AuthenticationFailed: ErrorCode.AUTH_FAILED,
        exceptions.PermissionDenied: ErrorCode.FORBIDDEN,
        exceptions.NotFound: ErrorCode.NOT_FOUND,
        exceptions.Throttled: ErrorCode.RATE_LIMITED,
        exceptions.MethodNotAllowed: ErrorCode.METHOD_NOT_ALLOWED,
        exceptions.ParseError: ErrorCode.INVALID_REQUEST,
    }
    if response is None:
        from django.http import Http404

        if isinstance(exc, Http404):
            return Response(
                envelope(error={"code": ErrorCode.NOT_FOUND, "details": None}, message="Resource not found."),
                status=404,
            )
        import logging

        logging.getLogger(__name__).exception("Unhandled API exception")
        return Response(
            envelope(
                error={"code": ErrorCode.INTERNAL_ERROR, "details": None}, message="The request could not be completed."
            ),
            status=500,
        )
    code = getattr(exc, "error_code", None) or next(
        (value for kind, value in codes.items() if isinstance(exc, kind)), ErrorCode.REQUEST_FAILED
    )
    response.data = envelope(
        error={"code": code, "details": response.data}, message="The request could not be completed."
    )
    return response


class EnvelopePagination(PageNumberPagination):
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response_schema(self, schema):
        return {
            "type": "object",
            "properties": {
                "success": {"type": "boolean"},
                "message": {"type": "string"},
                "data": schema,
                "error": {"nullable": True},
                "meta": {
                    "type": "object",
                    "properties": {
                        "pagination": {
                            "type": "object",
                            "properties": {
                                "page": {"type": "integer"},
                                "page_size": {"type": "integer"},
                                "total_items": {"type": "integer"},
                                "total_pages": {"type": "integer"},
                                "has_next": {"type": "boolean"},
                                "has_previous": {"type": "boolean"},
                            },
                        }
                    },
                },
            },
        }

    def get_paginated_response(self, data):
        assert self.page is not None and self.request is not None
        page = self.page
        return Response(
            envelope(
                data,
                meta={
                    "pagination": {
                        "page": page.number,
                        "page_size": self.get_page_size(self.request),
                        "total_items": page.paginator.count,
                        "total_pages": math.ceil(page.paginator.count / page.paginator.per_page),
                        "has_next": page.has_next(),
                        "has_previous": page.has_previous(),
                    }
                },
            )
        )


def not_found(request, exception=None):
    from django.http import JsonResponse

    return JsonResponse(
        envelope(
            error={"code": ErrorCode.NOT_FOUND, "details": None},
            message="Resource not found.",
            meta={"request_id": getattr(request, "request_id", "")},
        ),
        status=status.HTTP_404_NOT_FOUND,
    )
