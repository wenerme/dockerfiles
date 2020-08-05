FROM wener/base:openrc

# sshd for op
# python for manage like ansible
RUN apk add --no-cache openssh python3 \
    # prefer to enable syslog for service logging
    && rc-update add syslog \
    # enable local to run custom scripts
    && rc-update add local \
    # by default nothing will display
    && echo rc_verbose=yes >> /etc/conf.d/local \
    # start ssh for server
    && rc-update add sshd \
    # add sudo
    && apk add --no-cache sudo \
    # admin account - disable login but enable sudo
    && adduser -D admin \
    # NOPASSWORD
    && echo 'admin ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    # unlock user - use same ts to prevent unneed change
    && sed -i -re 's/^admin:.:\d+/admin:*:18000/' /etc/shadow

COPY 00-echo-ips.start /etc/local.d/
