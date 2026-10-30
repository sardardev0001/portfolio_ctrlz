# API response standard

Every ordinary `/api/v1/` JSON response is rendered by `core.responses.EnvelopeRenderer`:

```json
{"success":true,"message":"Operation completed successfully.","data":{},"error":null,"meta":{"request_id":"uuid"}}
```

On error, `success=false`, `data=null`, and `error={"code":"VALIDATION_ERROR","details":{...}}`. Stable codes include `VALIDATION_ERROR`, `AUTH_REQUIRED`, `AUTH_FAILED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMITED`, `METHOD_NOT_ALLOWED`, `INVALID_REQUEST`, and `INTERNAL_ERROR`. Clients act on `error.code`, not natural-language `message`.

Paginated viewsets include `meta.pagination` with `page`, `page_size`, `total_items`, `total_pages`, `has_next`, `has_previous`. The default page size is 20 and maximum 100. `X-Request-ID` mirrors `meta.request_id`. Binary media streams and empty 204 deletes are standard HTTP exceptions to JSON wrapping. OpenAPI is at `/api/v1/schema/`, Swagger UI at `/api/v1/docs/`.
