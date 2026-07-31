ARG GO_BASE_IMAGE=wener/go:1.26.3-r0-alpine-3.24.1-r0
FROM ${GO_BASE_IMAGE}

ARG TARGETARCH
ARG PROTOC_VERSION=35.1
ARG BUF_VERSION=v1.71.0
ARG PROTOC_GEN_GO_VERSION=v1.36.11
ARG PROTOC_GEN_GO_GRPC_VERSION=v1.6.2
ARG PROTOC_GEN_GO_HTTP_VERSION=v2.0.0-20260404020628-f149714c1d54
ARG PROTOC_GEN_OPENAPI_VERSION=v0.7.1
ARG WIRE_VERSION=v0.7.0
ARG GOIMPORTS_VERSION=v0.46.0
ARG GOFUMPT_VERSION=v0.10.0
ARG GOVULNCHECK_VERSION=v1.4.0
ARG MAGE_VERSION=v1.17.2
ARG GOCOVER_COBERTURA_VERSION=v1.5.0
ARG GOLANGCI_LINT_VERSION=v2.12.2
ARG GOTESTSUM_VERSION=v1.13.0

ENV GOPATH=/root/go \
    PATH=/root/go/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    GOPROXY=https://goproxy.cn,direct \
    GOTOOLCHAIN=local \
    CGO_ENABLED=0

RUN --mount=type=cache,id=apk-${TARGETARCH},sharing=locked,target=/var/cache/apk \
    apk add --no-cache \
      bash \
      ca-certificates \
      curl \
      file \
      gcompat \
      jq \
      just \
      libgcc \
      libstdc++ \
      openssh-client \
      rsync \
      tar \
      unzip \
      wget \
      xz

RUN set -eux; \
    case "${TARGETARCH}" in \
      amd64) protoc_arch="x86_64"; buf_arch="x86_64"; binary_arch="amd64" ;; \
      arm64) protoc_arch="aarch_64"; buf_arch="aarch64"; binary_arch="arm64" ;; \
      *) echo "unsupported TARGETARCH=${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    tmpdir="$(mktemp -d)"; \
    wget -O "${tmpdir}/protoc.zip" "https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-linux-${protoc_arch}.zip"; \
    unzip -q "${tmpdir}/protoc.zip" -d "${tmpdir}/protoc"; \
    install -m 0755 "${tmpdir}/protoc/bin/protoc" /usr/local/bin/protoc; \
    cp -R "${tmpdir}/protoc/include"/* /usr/local/include/; \
    wget -O "${tmpdir}/buf" "https://github.com/bufbuild/buf/releases/download/${BUF_VERSION}/buf-Linux-${buf_arch}"; \
    install -m 0755 "${tmpdir}/buf" /usr/local/bin/buf; \
    golangci_version="${GOLANGCI_LINT_VERSION#v}"; \
    wget -O "${tmpdir}/golangci-lint.tar.gz" "https://github.com/golangci/golangci-lint/releases/download/v${golangci_version}/golangci-lint-${golangci_version}-linux-${binary_arch}.tar.gz"; \
    tar -xzf "${tmpdir}/golangci-lint.tar.gz" -C "${tmpdir}"; \
    install -m 0755 "${tmpdir}/golangci-lint-${golangci_version}-linux-${binary_arch}/golangci-lint" /usr/local/bin/golangci-lint; \
    gotestsum_version="${GOTESTSUM_VERSION#v}"; \
    wget -O "${tmpdir}/gotestsum.tar.gz" "https://github.com/gotestyourself/gotestsum/releases/download/v${gotestsum_version}/gotestsum_${gotestsum_version}_linux_${binary_arch}.tar.gz"; \
    tar -xzf "${tmpdir}/gotestsum.tar.gz" -C "${tmpdir}"; \
    install -m 0755 "${tmpdir}/gotestsum" /usr/local/bin/gotestsum; \
    rm -rf "${tmpdir}"

RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/root/go/pkg/mod \
    set -eux; \
    GOBIN=/usr/local/bin go install google.golang.org/protobuf/cmd/protoc-gen-go@${PROTOC_GEN_GO_VERSION}; \
    GOBIN=/usr/local/bin go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@${PROTOC_GEN_GO_GRPC_VERSION}; \
    GOBIN=/usr/local/bin go install github.com/go-kratos/kratos/cmd/protoc-gen-go-http/v2@${PROTOC_GEN_GO_HTTP_VERSION}; \
    GOBIN=/usr/local/bin go install github.com/google/gnostic/cmd/protoc-gen-openapi@${PROTOC_GEN_OPENAPI_VERSION}; \
    GOBIN=/usr/local/bin go install github.com/google/wire/cmd/wire@${WIRE_VERSION}; \
    GOBIN=/usr/local/bin go install golang.org/x/tools/cmd/goimports@${GOIMPORTS_VERSION}; \
    GOBIN=/usr/local/bin go install mvdan.cc/gofumpt@${GOFUMPT_VERSION}; \
    GOBIN=/usr/local/bin go install golang.org/x/vuln/cmd/govulncheck@${GOVULNCHECK_VERSION}; \
    GOBIN=/usr/local/bin go install github.com/magefile/mage@${MAGE_VERSION}; \
    GOBIN=/usr/local/bin go install github.com/boumenot/gocover-cobertura@${GOCOVER_COBERTURA_VERSION}

WORKDIR /workspace

CMD ["go", "version"]
