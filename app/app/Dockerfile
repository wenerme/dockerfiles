FROM wener/base:openrc

# sshd for op
# python for manage like ansible
RUN apk add --no-cache openssh python3 \
    && rc-update add syslog \
    # enable local to auto start server
    && rc-update add local \
    # start ssh for server
    && rc-update add sshd \
    # add sudo
    && apk add --no-cache sudo \
    # admin account
    && adduser -D admin \
    && echo 'admin ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    # bash
    && apk --no-cache add bash \
    && mv /bin/sh /bin/ash \
    && ln -s /bin/bash /bin/sh
