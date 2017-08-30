FROM        alpine:edge
MAINTAINER  wener<wener@wener.me>

RUN echo http://mirrors.aliyun.com/alpine/edge/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/edge/community/ >> /etc/apk/repositories

# Base tools
RUN apk add --no-cache openssh-client curl busybox file

RUN mkdir /lib64 && ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2

# Use bash as default shell
RUN apk --no-cache add bash && \
    mv /bin/sh /bin/ash && \
    ln -s /bin/bash /bin/sh

COPY root /
