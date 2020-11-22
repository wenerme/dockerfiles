FROM  wener/base

# Install newer version
RUN apk add --no-cache go -X https://mirrors.aliyun.com/alpine/edge/community/ \
    && apk add --no-cache musl-dev git make gcc pkgconf
RUN mkdir /root/go
