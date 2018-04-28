FROM wener/base as builder
ENV ARCH=armhf
WORKDIR /root
RUN apk add --no-cache qemu-arm \
    && wget -q http://mirrors.aliyun.com/alpine/v3.7/releases/$ARCH/alpine-minirootfs-3.7.0-$ARCH.tar.gz \
    && mkdir target-root \
    && tar zxf alpine-minirootfs-3.7.0-$ARCH.tar.gz -C target-root \
    && cp /usr/bin/qemu-arm target-root/usr/bin/qemu-arm

FROM scratch
ENV ARCH=armhf
COPY --from=builder /root/target-root .
RUN echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/community/ >> /etc/apk/repositories

RUN apk add --no-cache curl busybox file nano libc6-compat

CMD [ "/usr/bin/qemu-arm", "/bin/busybox", "ash" ]

