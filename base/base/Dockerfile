FROM alpine as builder
ARG ALPINE_VERSION=3.12
ARG ALPINE_MIRROR=https://mirrors.aliyun.com/alpine

# Change the version to upgrade the base image
RUN mkdir /rootfs && cd /rootfs && \
    apk -X https://mirrors.aliyun.com/alpine/v${ALPINE_VERSION}/main --no-cache --allow-untrusted --root /rootfs --initdb add alpine-base

FROM scratch

ARG ALPINE_VERSION=3.12
ARG ALPINE_MIRROR=https://mirrors.aliyun.com/alpine
ENV ALPINE_VERSION=${ALPINE_VERSION}
ENV ALPINE_MIRROR=${ALPINE_MIRROR}

LABEL maintainer="wener@wener.me"\
    org.label-schema.name="base" \
    org.label-schema.vendor="Wener" \
    org.label-schema.description="Alpine Linux with Chinese mirror and common packages" \
    org.label-schema.url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.version="${ALPINE_VERSION}" \
    org.label-schema.license="MIT"

COPY --from=builder /rootfs /
RUN echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/main > /etc/apk/repositories; \
    echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/community >> /etc/apk/repositories

# Base tools
RUN apk add --no-cache curl busybox-extras file nano libc6-compat gcompat bash
SHELL [ "/bin/bash", "-c"]

COPY root /

CMD ["/bin/bash"]
