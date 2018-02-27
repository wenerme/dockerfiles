FROM wener/base:util

RUN apk add --no-cache alpine-sdk cmake git

RUN adduser -HDh /build builder \
	&& echo "builder  ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers \
	&& addgroup builder builder \
	&& addgroup builder abuild \
	&& addgroup builder ping \
	&& mkdir -p /build /var/cache/distfiles \
	&& chgrp abuild /build /var/cache/distfiles \
	&& chmod g+w /build /var/cache/distfiles

RUN cp /root/.bashrc /etc/profile
WORKDIR /build
