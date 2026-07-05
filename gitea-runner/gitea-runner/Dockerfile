ARG VERSION=2.0.0
ARG ALPINE_RELEASE=3.24.1
ARG BUILDER_REV=0

FROM wener/builder:${ALPINE_RELEASE}-r${BUILDER_REV}

ARG TARGETARCH
ARG VERSION

RUN set -eux; \
    apk add --no-cache tini bash git tzdata ca-certificates curl; \
    case "${TARGETARCH}" in \
      amd64) runner_arch="amd64" ;; \
      arm64) runner_arch="arm64" ;; \
      *) echo "unsupported TARGETARCH=${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    file="gitea-runner-${VERSION}-linux-${runner_arch}"; \
    base_url="https://gitea.com/gitea/runner/releases/download/v${VERSION}"; \
    curl -fsSL "${base_url}/${file}" -o "/tmp/${file}"; \
    curl -fsSL "${base_url}/checksums.txt" -o /tmp/checksums.txt; \
    grep "  ${file}$" /tmp/checksums.txt > /tmp/checksum; \
    cd /tmp; \
    sha256sum -c /tmp/checksum; \
    install -m 0755 "/tmp/${file}" /usr/local/bin/gitea-runner; \
    ln -s /usr/local/bin/gitea-runner /usr/local/bin/act_runner; \
    rm -f "/tmp/${file}" /tmp/checksums.txt /tmp/checksum; \
    gitea-runner --version

COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh

VOLUME /data

ENTRYPOINT ["/sbin/tini", "--", "run.sh"]
