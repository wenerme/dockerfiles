ARG ALPINE_RELEASE=3.24.3
FROM wener/base:${ALPINE_RELEASE} AS frp

ARG TARGETARCH
ARG VERSION=0.71.1

LABEL org.opencontainers.image.description="frp (fatedier/frp) client and server"

# inotify-tools lets a wrapper reload frp when the mounted config changes.
RUN set -eux; \
    case "${TARGETARCH}" in amd64|arm64) ;; *) echo "unsupported TARGETARCH=${TARGETARCH}" >&2; exit 1 ;; esac; \
    apk add --no-cache inotify-tools; \
    name="frp_${VERSION}_linux_${TARGETARCH}"; \
    base="https://github.com/fatedier/frp/releases/download/v${VERSION}"; \
    cd /tmp; \
    curl -fsSLO "${base}/${name}.tar.gz"; \
    curl -fsSL "${base}/frp_sha256_checksums.txt" | grep "  ${name}.tar.gz\$" | sha256sum -c -; \
    tar -xzf "${name}.tar.gz"; \
    install -m 755 "${name}/frpc" "${name}/frps" /usr/bin/; \
    install -d /etc/frp; \
    install -m 644 "${name}/frpc.toml" "${name}/frps.toml" /etc/frp/; \
    rm -rf "/tmp/${name}" "/tmp/${name}.tar.gz"; \
    frpc --version; frps --version

FROM frp AS frpc
CMD ["frpc", "-c", "/etc/frp/frpc.yaml"]

FROM frp AS frps
CMD ["frps", "-c", "/etc/frp/frps.yaml"]
