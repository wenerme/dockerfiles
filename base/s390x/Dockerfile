FROM wener/base as builder
ENV ARCH=s390x
WORKDIR /root
RUN QEMU_ARCH=${QEMU_ARCH:-$ARCH} \
    && apk add --no-cache qemu-$QEMU_ARCH \
    && wget -q https://mirrors.sjtug.sjtu.edu.cn/alpine/v$(sed -n 's/\.\d\+$//p' /etc/alpine-release)/releases/$ARCH/alpine-minirootfs-$(cat /etc/alpine-release)-$ARCH.tar.gz \
    && mkdir target-root \
    && tar zxf alpine-minirootfs-$(cat /etc/alpine-release)-$ARCH.tar.gz -C target-root \
    && cp /usr/bin/qemu-$QEMU_ARCH target-root/usr/bin \
    && cp /etc/apk/repositories target-root/etc/apk/repositories

FROM scratch
LABEL maintainer="wener@wener.me"\
    org.label-schema.name="base:s390x" \
    org.label-schema.vendor="Wener" \
    org.label-schema.description="Alpine Linux s390x based on x86_64 qemu emulator" \
    org.label-schema.url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.version="3.14" \
    org.label-schema.license="MIT"

ENV ALPINE_ARCH=s390x
COPY --from=builder /root/target-root .

CMD [ "/usr/bin/qemu-s390x", "/bin/busybox", "ash" ]

