FROM  wener/base

RUN apk upgrade --no-cache -a && apk add --no-cache musl-dev git make gcc pkgconf && \
  apk add --no-cache go -X https://mirrors.aliyun.com/alpine/edge/community
RUN mkdir /root/go
