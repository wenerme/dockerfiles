FROM wener/base as builder
ENV ARCH=s390x
WORKDIR /root
RUN apk add --no-cache qemu-$ARCH \
    && wget -q http://mirrors.aliyun.com/alpine/v3.7/releases/$ARCH/alpine-minirootfs-3.7.0-$ARCH.tar.gz \
    && mkdir target-root \
    && tar zxf alpine-minirootfs-3.7.0-$ARCH.tar.gz -C target-root \
    && cp /usr/bin/qemu-$ARCH target-root/usr/bin/qemu-$ARCH

FROM scratch
ENV ARCH=s390x
COPY --from=builder /root/target-root .
RUN echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/community/ >> /etc/apk/repositories

RUN apk add --no-cache curl busybox file nano libc6-compat

CMD [ "/usr/bin/qemu-s390x", "/bin/busybox", "ash" ]

