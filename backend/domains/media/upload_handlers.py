from django.core.files.uploadhandler import FileUploadHandler

from domains.media.validation import VIDEO_MAX_BYTES, MediaValidationError


class BoundedUploadHandler(FileUploadHandler):
    """Bound streamed/chunked uploads independently of Content-Length."""

    def new_file(self, *args, **kwargs):
        super().new_file(*args, **kwargs)
        self.bytes_received = 0

    def receive_data_chunk(self, raw_data, start):
        self.bytes_received += len(raw_data)
        if self.bytes_received > VIDEO_MAX_BYTES:
            # Django's generic parser error path closes completed files only.
            # Explicitly interrupt downstream handlers so a partial disk file is
            # removed immediately, even before file_complete has been called.
            for handler in getattr(self.request, "upload_handlers", []):
                if handler is not self:
                    handler.upload_interrupted()
            raise MediaValidationError("VIDEO_TOO_LARGE", status=413)
        return raw_data

    def file_complete(self, file_size):
        return None
