FROM scratch

ARG ALPINE_RELEASE
ARG ALPINE_VERSION
ARG ALPINE_MIRROR
ARG TARGETARCH
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

ADD alpine-minirootfs-${ALPINE_RELEASE}-${TARGETARCH}.tar.gz /
RUN echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/main > /etc/apk/repositories; \
    echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/community >> /etc/apk/repositories; \
    # minirootfs packages are frozen at the Alpine release; upgrade so a revision rebuild picks up security fixes
    apk upgrade -U --no-cache; \
    apk add --no-cache busybox-extras curl file nano libc6-compat gcompat bash;

SHELL [ "/bin/bash", "-c"]

COPY rootfs /

CMD ["/bin/bash","-l"]
