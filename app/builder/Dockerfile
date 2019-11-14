FROM wener/app

RUN apk add --no-cache alpine-sdk cmake git bash-completion

# use admin as build user
# uid=1000
RUN addgroup admin abuild \
	&& addgroup admin ping \
	&& mkdir -p /build /var/cache/distfiles \
	&& chgrp abuild /build /var/cache/distfiles \
	&& chmod g+w /build /var/cache/distfiles \
	# NOTE use admin as default password for ssh
	&& echo admin:admin | chpasswd

COPY .bashrc /home/admin
WORKDIR /build
