FROM        alpine:3.5
MAINTAINER  wener<wener@wener.me>

ENV ALPINE_VERSION=3.5

RUN echo http://mirrors.aliyun.com/alpine/v$ALPINE_VERSION/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/v$ALPINE_VERSION/community/ >> /etc/apk/repositories

# Base tools
RUN apk add --no-cache openssh-client curl busybox file nano

RUN mkdir /lib64 && ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2

ENV BASE_VERSION=3.5
