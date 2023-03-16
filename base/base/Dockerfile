FROM wener/base AS builder
ARG ALPINE_VERSION
ARG ALPINE_MIRROR

# Change the version to upgrade the base image
RUN mkdir /rootfs && cd /rootfs && \
    apk -X ${ALPINE_MIRROR}/v${ALPINE_VERSION}/main --allow-untrusted --root /rootfs --initdb add alpine-base
RUN echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/main > /rootfs/etc/apk/repositories; \
    echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/community >> /rootfs/etc/apk/repositories
RUN apk add --root /rootfs -U --no-cache curl busybox-extras file nano libc6-compat gcompat bash && \
    rm /rootfs/var/cache/apk/*

FROM scratch

ARG ALPINE_VERSION
ARG ALPINE_MIRROR
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
