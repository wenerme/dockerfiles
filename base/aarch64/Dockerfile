FROM wener/base as builder
ENV ARCH=aarch64
WORKDIR /root
RUN QEMU_ARCH=${QEMU_ARCH:-$ARCH} \
    && apk add --no-cache qemu-$QEMU_ARCH \
    && wget -q https://mirrors.tuna.tsinghua.edu.cn/alpine/v$(head -c3 /etc/alpine-release)/releases/$ARCH/alpine-minirootfs-$(cat /etc/alpine-release)-$ARCH.tar.gz \
    && mkdir target-root \
    && tar zxf alpine-minirootfs-$(cat /etc/alpine-release)-$ARCH.tar.gz -C target-root \
    && cp /usr/bin/qemu-$QEMU_ARCH target-root/usr/bin \
    && cp /etc/apk/repositories target-root/etc/apk/repositories

FROM scratch
LABEL maintainer="wener@wener.me"\
    org.label-schema.name="base:aarch64" \
    org.label-schema.vendor="Wener" \
    org.label-schema.description="Alpine Linux aarch64 based on x86_64 qemu emulator" \
    org.label-schema.url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.version="3.9" \
    org.label-schema.license="MIT"

ENV ALPINE_ARCH=aarch64
COPY --from=builder /root/target-root .

RUN apk add --no-cache curl busybox file nano libc6-compat

CMD [ "/usr/bin/qemu-aarch64", "/bin/busybox", "ash" ]

