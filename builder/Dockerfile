FROM        wener/base
MAINTAINER  wener<wener@wener.me>

# Base tools
RUN apk add --no-cache bash ca-certificates openssl git

#########
# Java
#########

# Default to UTF-8 file.encoding
ENV LANG C.UTF-8

# add a simple script that can auto-detect the appropriate JAVA_HOME value
# based on whether the JDK or only the JRE is installed
RUN { \
		echo '#!/bin/sh'; \
		echo 'set -e'; \
		echo; \
		echo 'dirname "$(dirname "$(readlink -f "$(which javac || which java)")")"'; \
	} > /usr/local/bin/docker-java-home \
	&& chmod +x /usr/local/bin/docker-java-home
ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV PATH $PATH:/usr/lib/jvm/java-1.8-openjdk/jre/bin:/usr/lib/jvm/java-1.8-openjdk/bin

ENV JAVA_VERSION 8u111
ENV JAVA_ALPINE_VERSION 8.111.14-r1

RUN set -x \
	&& apk add --no-cache \
		openjdk8="$JAVA_ALPINE_VERSION" \
	&& [ "$JAVA_HOME" = "$(docker-java-home)" ]

# Add maven
ENV MAVEN_VERSION 3.3.9
ENV MAVEN_ALPINE_VERSION 3.3.9-r1
RUN apk add --no-cache maven="$MAVEN_ALPINE_VERSION"

#########
# Golang
#########
ENV GO_VERSION 1.7.3
ENV GO_ALPINE_VERSION 1.7.3-r0
RUN apk add --no-cache go="$GO_ALPINE_VERSION" go-tools="$GO_ALPINE_VERSION"
RUN apk add --no-cache godep

#########
# Nodejs
#########
ENV NODE_VERSION 6.9.2
ENV NODE_ALPINE_VERSION 6.9.2-r1
RUN apk add --no-cache nodejs="$NODE_ALPINE_VERSION" nodejs-dev="$NODE_ALPINE_VERSION"

RUN npm config set registry https://registry.npm.taobao.org

# Global install yarn package manager
RUN npm set progress=false && \
    npm install -g --silent --progress=false yarn && \
    npm cache clean

#########
# Python
#########
ENV PYTHON2_ALPINE_VERSION 2.7.13-r0
RUN apk add --no-cache python2="$PYTHON2_ALPINE_VERSION" python2-dev="$PYTHON2_ALPINE_VERSION"

#########
# GCC
#########
RUN apk add --no-cache gcc g++ autoconf automake

#########
# Docker
#########
ENV DOCKER_VERSION 1.12.6
ENV DOCKER_ALPINE_VERSION 1.12.6-r0
RUN apk add --no-cache docker="$DOCKER_ALPINE_VERSION"

#########
# Helper
#########
RUN apk add --no-cache jq make

ADD root /

CMD ["bash"]
