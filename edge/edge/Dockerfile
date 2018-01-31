FROM        alpine:edge
MAINTAINER  wener<wener@wener.me>

RUN echo http://mirrors.aliyun.com/alpine/edge/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/edge/community/ >> /etc/apk/repositories

# Base tools
RUN apk add --no-cache openssh-client curl busybox file nano libc6-compat

