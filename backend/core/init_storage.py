"""Create the development S3 bucket; credentials are read from the environment."""

import os
import time

import boto3
from botocore.exceptions import ClientError, EndpointConnectionError


def main():
    client = boto3.client(
        "s3",
        endpoint_url=os.environ["S3_ENDPOINT_URL"],
        aws_access_key_id=os.environ["S3_ACCESS_KEY"],
        aws_secret_access_key=os.environ["S3_SECRET_KEY"],
        region_name=os.getenv("S3_REGION", "us-east-1"),
    )
    bucket = os.getenv("S3_BUCKET", "ctrlz")
    for attempt in range(30):
        try:
            try:
                client.head_bucket(Bucket=bucket)
            except ClientError as exc:
                if exc.response["Error"]["Code"] not in ("404", "NoSuchBucket"):
                    raise
                client.create_bucket(Bucket=bucket)
            print("Storage bucket is ready")
            return
        except EndpointConnectionError:
            if attempt == 29:
                raise
            time.sleep(2)


if __name__ == "__main__":
    main()
