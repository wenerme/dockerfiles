ARG GO_VERSION=1.25
ARG ALPINE_RELEASE=3.23.0

# =========================================
# Builder
# =========================================
FROM golang:${GO_VERSION}-alpine AS builder
ARG MIHOMO_REPO=https://github.com/wenerme/mihomo.git
ARG MIHOMO_BRANCH=develop
ARG MIHOMO_REV=

RUN apk add --no-cache git
WORKDIR /src
RUN if [ -n "${MIHOMO_REV}" ]; then \
      git clone ${MIHOMO_REPO} . && git checkout ${MIHOMO_REV}; \
    else \
      git clone --depth 1 --branch ${MIHOMO_BRANCH} ${MIHOMO_REPO} .; \
    fi

# GOAMD64=v1 for maximum compatibility (J1900 etc.)
# Crypto acceleration (AES-NI) is runtime-detected regardless of GOAMD64 level
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOAMD64=v1 go build \
      -tags with_gvisor \
      -trimpath \
      -ldflags "-X 'github.com/metacubex/mihomo/constant.Version=$(git describe --tags --always)' -w -s -buildid=" \
      -o /mihomo \
    && /mihomo -v

# =========================================
# Runtime
# =========================================
ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
COPY --from=builder /mihomo /usr/bin/mihomo
CMD ["/usr/bin/mihomo"]
