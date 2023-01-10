FROM wener/app:ssh

RUN apk add --no-cache dumb-init docker git make openssh gitlab-runner docker-cli-buildx  \
    && docker buildx use default  \
    && docker buildx install

RUN rc-update add gitlab-runner

COPY rootfs /
