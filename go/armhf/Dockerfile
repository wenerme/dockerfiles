FROM  wener/base:armhf

# Install newer version
RUN apk add --no-cache go -X https://mirrors.sjtug.sjtu.edu.cn/alpine/edge/community/ \
    && apk add --no-cache musl-dev git make gcc pkgconf
RUN mkdir /root/go
