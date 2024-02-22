ARG ALPINE_RELEASE
FROM wener/app:${ALPINE_RELEASE}

RUN apk --no-cache add samba samba-dc \
    && rc-update add samba

COPY rootfs/ /

EXPOSE 137/udp 138/udp 139 445
