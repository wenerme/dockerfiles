ARG GO_VERSION=1.25
ARG ALPINE_RELEASE=3.23.0

# =========================================
# Builder
# =========================================
FROM golang:${GO_VERSION}-alpine AS builder
ARG LIGOLO_REPO=https://github.com/nicocha30/ligolo-ng.git
ARG LIGOLO_BRANCH=master
ARG LIGOLO_REV=913fe64e088d5db2185d392965bf4cd3dd1d9495
ARG VERSION=0.8.3

RUN apk add --no-cache git
WORKDIR /src
RUN if [ -n "${LIGOLO_REV}" ]; then \
      git clone ${LIGOLO_REPO} . && git checkout ${LIGOLO_REV}; \
    else \
      git clone --depth 1 --branch ${LIGOLO_BRANCH} ${LIGOLO_REPO} .; \
    fi

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    set -eux; \
    COMMIT="$(git rev-parse HEAD)"; \
    DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"; \
    CGO_ENABLED=0 go build \
      -trimpath \
      -ldflags "-X main.version=${VERSION} -X main.commit=${COMMIT} -X main.date=${DATE} -w -s -buildid=" \
      -o /usr/local/bin/ligolo-ng-agent ./cmd/agent; \
    CGO_ENABLED=0 go build \
      -trimpath \
      -ldflags "-X main.version=${VERSION} -X main.commit=${COMMIT} -X main.date=${DATE} -w -s -buildid=" \
      -o /usr/local/bin/ligolo-ng-proxy ./cmd/proxy; \
    /usr/local/bin/ligolo-ng-agent -version; \
    /usr/local/bin/ligolo-ng-proxy -version

# =========================================
# Runtime
# =========================================
ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
COPY --from=builder /usr/local/bin/ligolo-ng-agent /usr/local/bin/ligolo-ng-agent
COPY --from=builder /usr/local/bin/ligolo-ng-proxy /usr/local/bin/ligolo-ng-proxy
ENTRYPOINT ["/usr/local/bin/ligolo-ng-agent"]
CMD ["-h"]
