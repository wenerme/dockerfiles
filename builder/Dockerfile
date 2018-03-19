FROM        wener/base:builder
MAINTAINER  wener<wener@wener.me>

#########
# Golang
#########
RUN apk add --no-cache go go-tools
RUN apk add --no-cache godep

#########
# Nodejs
#########
RUN apk add --no-cache nodejs-current nodejs-current-dev yarn

RUN npm config set registry https://registry.npm.taobao.org


#########
# Python
#########
RUN apk add --no-cache python2 python2-dev
RUN apk add --no-cache python3 python3-dev

#########
# Docker
#########
RUN apk add --no-cache docker

#########
# Helper
#########
RUN apk add --no-cache jq

COPY root /

CMD ["bash"]
