FROM        wener/base

MAINTAINER  wener<wener@wener.me>

ENV NODE_VERSION 6.9.2-r1
ENV NODE_ALPINE_VERSION 6.9.2-r1
RUN apk add --no-cache nodejs="$NODE_ALPINE_VERSION"

RUN npm config set registry https://registry.npm.taobao.org

# Global install yarn package manager
RUN npm set progress=false && \
    npm install -g --silent --progress=false yarn && \
    npm cache clean

ENTRYPOINT ["node"]
