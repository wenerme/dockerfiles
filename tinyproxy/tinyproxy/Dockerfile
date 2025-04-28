ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

RUN apk add --no-cache tinyproxy

COPY rootfs/ /

ENTRYPOINT ["/entrypoint.sh"]
