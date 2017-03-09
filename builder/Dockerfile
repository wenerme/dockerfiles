FROM        wener/java
MAINTAINER  wener<wener@wener.me>

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

COPY root /

CMD ["bash"]
