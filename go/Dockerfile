FROM        wener/edge:bash
MAINTAINER  wener<wener@wener.me>

RUN apk add --no-cache go go-tools musl-dev
RUN mkdir /lib64 && ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2

ENTRYPOINT ["go"]
