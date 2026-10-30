"""Create a NEW private runtime environment; never display generated secrets."""

import argparse
import os
import re
import secrets
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--domain", required=True)
parser.add_argument("--storage", choices=("filesystem", "s3"), default="filesystem")
parser.add_argument(
    "--minio-image", default="", help="Required for S3: a verified image reference"
)
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
if not re.fullmatch(r"[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}", args.domain):
    parser.error("Supply a verified ASCII domain")
if args.storage == "s3" and not re.fullmatch(r"[a-zA-Z0-9._/@:-]+", args.minio_image):
    parser.error("Invalid image reference")


def secret():
    return secrets.token_urlsafe(48)


storage_secret = secret()
values = {
    "DEBUG": "false",
    "DJANGO_SECRET_KEY": secret(),
    "ALLOWED_HOSTS": f"{args.domain},www.{args.domain},backend,localhost,127.0.0.1",
    "CSRF_TRUSTED_ORIGINS": f"https://{args.domain},https://www.{args.domain}",
    "CORS_ALLOWED_ORIGINS": f"https://{args.domain},https://www.{args.domain}",
    "NEXT_PUBLIC_SITE_URL": f"https://{args.domain}",
    "SITE_URL": f"https://{args.domain}",
    "SECURE_SSL_REDIRECT": "false",  # Public HTTP redirect is enforced at host Nginx.
    "HSTS_INCLUDE_SUBDOMAINS": "false",
    "HSTS_PRELOAD": "false",
    "POSTGRES_HOST": "postgres",
    "POSTGRES_DB": "ctrlz",
    "POSTGRES_USER": "ctrlz",
    "POSTGRES_PASSWORD": secret(),
    "S3_ENDPOINT_URL": "http://minio:9000" if args.storage == "s3" else "",
    "COMPOSE_PROFILES": "s3" if args.storage == "s3" else "",
    "S3_ACCESS_KEY": "ctrlz-production",
    "S3_SECRET_KEY": storage_secret,
    "S3_BUCKET": "ctrlz-production",
    "S3_REGION": "us-east-1",
    "MINIO_ROOT_USER": "ctrlz-production",
    "MINIO_ROOT_PASSWORD": storage_secret,
    "MINIO_IMAGE": args.minio_image,
    "API_PROXY_TOKEN": secret(),
    "GUNICORN_WORKERS": "1",
    "GUNICORN_THREADS": "2",
    "BACKEND_MEMORY_LIMIT": "384m",
    "FRONTEND_MEMORY_LIMIT": "256m",
    "POSTGRES_MEMORY_LIMIT": "192m",
    "MINIO_MEMORY_LIMIT": "512m",
}
args.output.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
descriptor = os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(descriptor, "w", encoding="utf8", newline="\n") as destination:
    destination.write("".join(f"{key}={value}\n" for key, value in values.items()))
print(
    "A new private production environment was created; no secret values were printed."
)
