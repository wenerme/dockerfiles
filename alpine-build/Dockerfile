FROM wener/base:bash

RUN apk add --no-cache alpine-sdk

RUN apk add --no-cache sudo \
    # admin account - disable login but enable sudo
    && adduser -D admin \
    # NOPASSWORD
    && echo 'admin ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    # unlock user - use same ts to prevent unneed change
    && sed -i -re 's/^admin:.:\d+/admin:*:18000/' /etc/shadow

# use admin as build user
# uid=1000
RUN addgroup admin abuild \
	&& addgroup admin ping \
	&& mkdir -p /build /var/cache/distfiles \
	&& chgrp abuild /build /var/cache/distfiles \
	&& chmod g+w /build /var/cache/distfiles

USER admin
