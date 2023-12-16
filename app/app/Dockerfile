ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}-openrc

# syslog for service logging
# crond for commond task
# local for pre start script
# sudo & doas for privilege escalation
RUN \
    rc-update add syslog \
    && rc-update add crond \
    && rc-update add machine-id \
    && rc-update add local \
    # by default nothing will display
    && echo rc_verbose=yes >> /etc/conf.d/local \
    && apk add --no-cache sudo doas \
    # admin account - disable login but enable sudo
    && adduser -D admin \
    # NOPASSWORD
    && echo 'admin ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    && echo 'permit nopass admin as root' >> /etc/doas.d/admin.conf \
    # unlock user - use same ts to avoid change
    && sed -i -re 's/^admin:.:\d+/admin:*:18000/' /etc/shadow

COPY 00-echo-ips.start /etc/local.d/
