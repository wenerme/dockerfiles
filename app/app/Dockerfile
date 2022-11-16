FROM wener/base:openrc

RUN \
    # enable syslog for service logging
    rc-update add syslog \
    # enable local to run custom scripts
    && rc-update add local \
    # by default nothing will display
    && echo rc_verbose=yes >> /etc/conf.d/local \
    # add sudo
    && apk add --no-cache sudo doas \
    # admin account - disable login but enable sudo
    && adduser -D admin \
    # NOPASSWORD
    && echo 'admin ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    && echo 'permit nopass admin as root' >> /etc/doas.d/admin.conf \
    # unlock user - use same ts to avoid change
    && sed -i -re 's/^admin:.:\d+/admin:*:18000/' /etc/shadow

COPY 00-echo-ips.start /etc/local.d/
