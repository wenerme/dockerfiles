FROM alpine AS builder
ARG ALPINE_VERSION=3.10
ARG ALPINE_MIRROR=https://mirrors.sjtug.sjtu.edu.cn/alpine

# Change the version to upgrade the base image
RUN --mount=type=cache,target=/etc/apk/cache mkdir /rootfs && cd /rootfs && \
    apk -X ${ALPINE_MIRROR}/v${ALPINE_VERSION}/main --allow-untrusted --root /rootfs --initdb add alpine-base
RUN echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/main > /rootfs/etc/apk/repositories; \
    echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/community >> /rootfs/etc/apk/repositories
RUN --mount=type=cache,target=/etc/apk/cache apk add --root /rootfs --no-cache curl busybox-extras file nano libc6-compat gcompat bash

FROM scratch

ARG ALPINE_VERSION=3.10
ARG ALPINE_MIRROR=https://mirrors.sjtug.sjtu.edu.cn/alpine
ENV ALPINE_VERSION=${ALPINE_VERSION}
ENV ALPINE_MIRROR=${ALPINE_MIRROR}

LABEL maintainer="wener@wener.me" \
    org.label-schema.name="base" \
    org.label-schema.vendor="Wener" \
    org.label-schema.description="Alpine Linux with chinese mirror and common packages" \
    org.label-schema.url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.version="${ALPINE_VERSION}" \
    org.label-schema.license="MIT"

COPY --from=builder /rootfs /
SHELL [ "/bin/bash", "-c"]

COPY rootfs /

CMD ["/bin/bash","-l"]
