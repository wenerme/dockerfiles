FROM        alpine:3.6
MAINTAINER  wener<wener@wener.me>

ENV ALPINE_VERSION=3.6

RUN echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/community/ >> /etc/apk/repositories

# Base tools
RUN apk add --no-cache openssh-client curl busybox file nano

RUN mkdir /lib64 && ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2
