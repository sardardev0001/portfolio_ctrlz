from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CookieJWTScheme(OpenApiAuthenticationExtension):
    target_class = "core.auth.CookieJWTAuthentication"
    name = "cookieJWT"

    def get_security_definition(self, auto_schema):
        return {
            "type": "apiKey",
            "in": "cookie",
            "name": "ctrlz_access",
            "description": "HttpOnly access cookie from auth/login; unsafe requests also require X-CSRFToken.",
        }


class MediaCookieJWTScheme(CookieJWTScheme):
    target_class = "core.upload_auth.MediaUploadAuthentication"
    name = "mediaCookieJWT"


def wrap_responses(result, generator, request, public):
    """Describe the runtime JSON envelope rather than DRF's unwrapped defaults."""
    components = result.setdefault("components", {}).setdefault("schemas", {})
    components["ApiErrorEnvelope"] = {
        "type": "object",
        "required": ["success", "message", "data", "error", "meta"],
        "properties": {
            "success": {"type": "boolean", "enum": [False]},
            "message": {"type": "string"},
            "data": {"nullable": True},
            "error": {"type": "object", "properties": {"code": {"type": "string"}, "details": {"nullable": True}}},
            "meta": {"type": "object", "properties": {"request_id": {"type": "string", "format": "uuid"}}},
        },
    }
    for path, methods in result.get("paths", {}).items():
        if path.endswith("schema/"):
            continue
        for method, operation in methods.items():
            if method not in ("get", "post", "patch", "put", "delete"):
                continue
            responses = operation.setdefault("responses", {})
            for code, response in responses.items():
                for mime, content in response.get("content", {}).items():
                    if mime != "application/json" or not str(code).startswith("2"):
                        continue
                    payload = content.get("schema", {})
                    if payload.get("properties", {}).get("success"):
                        continue
                    meta = {"type": "object", "properties": {"request_id": {"type": "string", "format": "uuid"}}}
                    content["schema"] = {
                        "type": "object",
                        "required": ["success", "message", "data", "error", "meta"],
                        "properties": {
                            "success": {"type": "boolean", "enum": [True]},
                            "message": {"type": "string"},
                            "data": payload,
                            "error": {"nullable": True},
                            "meta": meta,
                        },
                    }
            for code in ("400", "401", "403", "404", "429"):
                responses.setdefault(
                    code,
                    {
                        "description": "Versioned API error",
                        "content": {"application/json": {"schema": {"$ref": "#/components/schemas/ApiErrorEnvelope"}}},
                    },
                )
    return result
