FROM wener/base as builder
ENV ARCH=ppc64le
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
    org.label-schema.name="base:ppc64le" \
    org.label-schema.vendor="Wener" \
    org.label-schema.description="Alpine Linux ppc64le based on x86_64 qemu emulator" \
    org.label-schema.url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.version="3.14" \
    org.label-schema.license="MIT"

ENV ALPINE_ARCH=ppc64le
COPY --from=builder /root/target-root .

# RUN /usr/bin/qemu-ppc64le apk add --no-cache curl busybox file nano libc6-compat

CMD [ "/usr/bin/qemu-ppc64le", "/bin/busybox", "ash" ]

