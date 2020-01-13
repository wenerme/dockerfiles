FROM alpine as builder
# Change the version to upgrade the base image
RUN mkdir /rootfs && cd /rootfs && \
    apk -X https://mirrors.tuna.tsinghua.edu.cn/alpine/v3.11/main --no-cache --allow-untrusted --root /rootfs --initdb add alpine-base

FROM scratch
LABEL maintainer="wener@wener.me"\
    org.label-schema.name="base" \
    org.label-schema.vendor="Wener" \
    org.label-schema.description="Alpine Linux with Chinese mirror and common packages" \
    org.label-schema.url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.version="3.11" \
    org.label-schema.license="MIT"

ENV ALPINE_VERSION=3.11

COPY --from=builder /rootfs /
RUN echo https://mirrors.tuna.tsinghua.edu.cn/alpine/v$(sed -n 's/\.\d\+$//p' /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo https://mirrors.tuna.tsinghua.edu.cn/alpine/v$(sed -n 's/\.\d\+$//p' /etc/alpine-release)/community/ >> /etc/apk/repositories

# Base tools
RUN apk add --no-cache curl busybox-extras file nano libc6-compat

CMD ["/bin/sh"]
