ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

RUN apk add --no-cache alpine-sdk git bash-completion sudo ccache

# uid 1000
RUN adduser -HDh /build builder \
	&& echo "builder  ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers \
	&& addgroup builder builder \
	&& addgroup builder abuild \
	&& addgroup builder ping \
	&& mkdir -p /build /var/cache/distfiles \
	&& chgrp abuild /build /var/cache/distfiles \
	&& chmod g+w /build /var/cache/distfiles

RUN cp /root/.bashrc /etc/profile

COPY rootfs /

USER builder

WORKDIR /build

CMD ["/bin/bash", "-l"]
