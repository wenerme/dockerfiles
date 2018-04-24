FROM wener/base as builder
RUN mkdir /rootfs && cd /rootfs && \
    apk -X http://mirrors.aliyun.com/alpine/v3.7/main/ --no-cache --allow-untrusted --root /rootfs --initdb add alpine-base

FROM scratch
COPY --from=builder /rootfs /

LABEL org.label-schema.name="base" \
        org.label-schema.vendor="Wener" \
        org.label-schema.description="Alpine Linux with China mirrors and common packages" \
        org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
        org.label-schema.version="3.7" \
        org.label-schema.license="MIT"

RUN echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/community/ >> /etc/apk/repositories

# Base tools
RUN apk add --no-cache curl busybox-extras file nano libc6-compat

CMD ["/bin/sh"]
