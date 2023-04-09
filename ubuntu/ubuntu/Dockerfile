ARG VERSION
# ARG VERSION_CODENAME
FROM ubuntu:$VERSION

LABEL maintainer="wener@wener.me"\
    org.label-schema.name="ubuntu" \
    org.label-schema.vendor="Wener" \
    org.label-schema.description="Ubuntu with Chinese mirror" \
    org.label-schema.url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.license="MIT"

COPY setup-image.sh /
RUN sh setup-image.sh

COPY root /
