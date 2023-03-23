# syntax=docker/dockerfile:1

FROM wener/app

# sshd for op
# python for manage like ansible
RUN apk add --no-cache openssh python3 \
    # start ssh for server
    && rc-update add sshd

EXPOSE 22
