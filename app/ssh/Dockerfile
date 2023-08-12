# syntax=docker/dockerfile:1
ARG ALPINE_RELEASE
FROM wener/app:${ALPINE_RELEASE}

# sshd for op
# python for manage like ansible
RUN apk add --no-cache openssh python3 \
    # start ssh for server
    && rc-update add sshd

EXPOSE 22
