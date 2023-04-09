FROM jenkins/ssh-agent:4.13.0-alpine-jdk17

ARG ALPINE_MIRROR=https://mirrors.sjtug.sjtu.edu.cn/alpine
RUN echo ${ALPINE_MIRROR}/v3.17/main > /etc/apk/repositories; \
    echo ${ALPINE_MIRROR}/v3.17/community >> /etc/apk/repositories

RUN apk upgrade -a --no-cache && \
    apk add --no-cache \
    curl busybox-extras file nano libc6-compat gcompat bash \
    gcc g++ python3-dev musl-dev linux-headers build-base util-linux coreutils findutils unzip sed grep tree pkgconf \
    docker docker-cli-buildx \
    python3 py3-pip \
    go \
    maven \
    nodejs npm  \
    jq yq && \
    npm install -g yarn pnpm && \
    npm cache clean --force
