FROM        alpine:3.7
MAINTAINER  wener<wener@wener.me>

RUN echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/community/ >> /etc/apk/repositories

# Base tools
RUN apk add --no-cache openssh-client curl busybox file nano libc6-compat
