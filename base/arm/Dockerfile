FROM wener/base as builder
WORKDIR /root
RUN apk add --no-cache qemu-arm \
    && wget -q http://mirrors.aliyun.com/alpine/v3.7/releases/armhf/alpine-minirootfs-3.7.0-armhf.tar.gz \
    && mkdir arm-root \
    && tar zxf alpine-minirootfs-3.7.0-armhf.tar.gz -C arm-root \
    && cp /usr/bin/qemu-arm arm-root/usr/bin/qemu-arm

FROM scratch
COPY --from=builder /root/arm-root .
RUN echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/community/ >> /etc/apk/repositories

RUN apk add --no-cache openssh-client curl busybox file nano libc6-compat

CMD [ "/usr/bin/qemu-arm", "/bin/busybox", "ash" ]

