# syntax=docker/dockerfile:1

ARG RELEASE_VERSION
FROM wener/base:${RELEASE_VERSION}-openrc

RUN \
    # prefer to enable syslog for service logging
    rc-update add syslog \
    # enable local to run custom scripts
    && rc-update add local \
    # by default nothing will display
    && echo rc_verbose=yes >> /etc/conf.d/local \
    # add sudo
    && apk add --no-cache sudo \
    # admin account - disable login but enable sudo
    && adduser -D admin \
    # NOPASSWORD
    && echo 'admin ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    # unlock user - use same ts to prevent unneed change
    && sed -i -re 's/^admin:.:\d+/admin:*:18000/' /etc/shadow

COPY 00-echo-ips.start /etc/local.d/
