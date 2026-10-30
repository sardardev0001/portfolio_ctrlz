import logging
import time
import uuid

from core.logging import request_id

logger = logging.getLogger("ctrlz.requests")


class RequestIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = str(uuid.uuid4())
        token = request_id.set(request.request_id)
        started = time.perf_counter()
        try:
            response = self.get_response(request)
            response["X-Request-ID"] = request.request_id
            match = getattr(request, "resolver_match", None)
            logger.info(
                "request_completed",
                extra={
                    "method": request.method,
                    "route": getattr(match, "route", "unresolved"),
                    "status": response.status_code,
                    "duration_ms": round((time.perf_counter() - started) * 1000, 2),
                },
            )
            return response
        finally:
            request_id.reset(token)
