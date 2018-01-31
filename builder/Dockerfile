FROM        wener/java:maven
MAINTAINER  wener<wener@wener.me>

#########
# Golang
#########
RUN apk add --no-cache go go-tools
RUN apk add --no-cache godep

#########
# Nodejs
#########
RUN apk add --no-cache nodejs nodejs-dev

RUN npm config set registry https://registry.npm.taobao.org

# Global install yarn package manager
RUN npm set progress=false && \
    npm install -g --silent --progress=false yarn && \
    npm cache clean

#########
# Python
#########
RUN apk add --no-cache python2 python2-dev

#########
# GCC
#########
RUN apk add --no-cache gcc g++ autoconf automake make cmake

#########
# Docker
#########
RUN apk add --no-cache docker

#########
# Helper
#########
RUN apk add --no-cache jq make

COPY root /

CMD ["bash"]
