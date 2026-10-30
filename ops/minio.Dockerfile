FROM golang:1.26-bookworm AS builder
ARG GOPROXY=https://proxy.golang.org|direct
ENV CGO_ENABLED=0 GOPROXY=${GOPROXY}
RUN git clone --depth 1 --branch RELEASE.2025-10-15T17-29-55Z https://github.com/minio/minio.git /src
WORKDIR /src
RUN --mount=type=cache,target=/go/pkg/mod --mount=type=cache,target=/root/.cache/go-build go build -trimpath -o /go/bin/minio .
FROM python:3.12-slim
RUN useradd -m -u 10001 minio && mkdir /data && chown minio:minio /data
COPY --from=builder /go/bin/minio /usr/local/bin/minio
USER minio
EXPOSE 9000 9001
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s CMD python -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:9000/minio/health/live',timeout=3)"
ENTRYPOINT ["minio"]
CMD ["server", "/data", "--console-address", ":9001"]
