ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

RUN apk add --no-cache -X https://mirrors.aliyun.com/alpine/edge/testing sing-box

# COPY rootfs /

RUN mkdir -p /var/lib/sing-box

# sing-box -C /etc/sing-box run
CMD ["/usr/bin/sing-box","run","-C","/etc/sing-box/"]
