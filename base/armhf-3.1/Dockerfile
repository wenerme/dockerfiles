FROM wener/base as builder
ENV ARCH=armhf
ENV QEMU_ARCH=arm
WORKDIR /root
# http://mirrors.sjtug.sjtu.edu.cn/alpine/v3.1/releases/armhf/alpine-rpi-3.1.4-armhf.rpi.tar.gz
RUN QEMU_ARCH=${QEMU_ARCH:-$ARCH} \
    && apk add --no-cache qemu-$QEMU_ARCH \
    && wget -q http://mirrors.sjtug.sjtu.edu.cn/alpine/v3.1/main/armhf/apk-tools-static-2.5.0_rc1-r1.apk \
    && tar -zxvf apk-tools-static-2.5.0_rc1-r1.apk sbin/apk.static --strip-components 1 \
    && mkdir target-root \
    && ./apk.static -X http://mirrors.sjtug.sjtu.edu.cn/alpine/v3.1/main -U --allow-untrusted -p target-root --initdb add alpine-base \
    && cp /usr/bin/qemu-$QEMU_ARCH target-root/usr/bin \
    && cp /etc/apk/repositories target-root/etc/apk/repositories

FROM scratch

ARG ALPINE_VERSION=3.1
# 3.1 需要使用 http
ARG ALPINE_MIRROR=http://mirrors.sjtug.sjtu.edu.cn/alpine
ENV ALPINE_VERSION=${ALPINE_VERSION}
ENV ALPINE_MIRROR=${ALPINE_MIRROR}

ENV ALPINE_ARCH=armhf
COPY --from=builder /root/target-root .

# 3.1 没有 community 有 testing
RUN echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/main > /etc/apk/repositories; \
    echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/testing >> /etc/apk/repositories

# 3.1 不支持 --no-cahe
RUN apk update && apk add curl file nano bash
SHELL [ "/bin/bash", "-c"]

CMD [ "/usr/bin/qemu-arm", "/bin/bash" ]

