# syntax = docker/dockerfile:1

ARG ALPINE_RELEASE
ARG TARGETARCH
FROM wener/app:${ALPINE_RELEASE}

ENV LANG C.UTF-8

# java8
RUN { \
		echo '#!/bin/sh'; \
		echo 'set -e'; \
		echo; \
		echo 'dirname "$(dirname "$(readlink -f "$(which javac || which java)")")"'; \
	} > /usr/local/bin/docker-java-home \
	&& chmod +x /usr/local/bin/docker-java-home
ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV PATH $PATH:/usr/lib/jvm/java-1.8-openjdk/jre/bin:/usr/lib/jvm/java-1.8-openjdk/bin

RUN --mount=type=cache,target=/etc/apk/cache \
  set -x \
	&& apk add --no-cache openjdk8 \
	&& [ "$JAVA_HOME" = "$(docker-java-home)" ]

# 基础依赖+工具
RUN --mount=type=cache,target=/etc/apk/cache \
    apk add --no-cache \
    # container
    docker docker-cli-buildx \
    # build
    gcc g++ python3-dev musl-dev linux-headers build-base util-linux coreutils findutils \
    openssh git make zip tar rsync grep \
    # qci deps
    python3 py3-pip curl unzip go \
    # misc
    maven tree \
    # java
#    openjdk11 openjdk17 \
    # nodejs
    nodejs npm

# NodeJS - 无 arm64
#RUN apk add --no-cache libstdc++ libgcc \
#    && curl -sfL https://ghproxy.com/https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
#    && chmod +x n \
#    && N_NODE_MIRROR=https://npmmirror.com/mirrors/node-unofficial-builds n --arch x64-musl 16 \
#    && n rm 16

# CI_HOME
#RUN mkdir -p /root/codingci
#WORKDIR /root/codingci

# tools
# install.sh 会删除
#RUN curl -fL  "https://coding-public-generic.pkg.coding.net/cci/release/cci-agent/jenkins.war?version=2.293-cci" -o jenkins.war \
#    && curl -fL  "https://coding-public-generic.pkg.coding.net/cci/release/jenkinsHome.zip?version=latest" -o jenkins_home.zip \
#    && unzip jenkins_home.zip \
#    && rm jenkins_home.zip
