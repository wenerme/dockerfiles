FROM        node:7-alpine

MAINTAINER  wener<wener@wener.me>

RUN npm config set registry https://registry.npm.taobao.org

# Global install yarn package manager
RUN npm set progress=false && \
    npm install -g --silent --progress=false yarn && \
    npm cache clean

ENTRYPOINT ["node"]
