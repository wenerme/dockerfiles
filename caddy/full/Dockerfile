#
# Builder
#
FROM abiosoft/caddy:builder as builder

ARG version="0.10.12"
# Build failed grpc,gopkg
ARG plugins="authz,awses,awslambda,cache,cgi,cors,datadog,expires,filemanager,filter,forwardproxy,git,hugo,ipfilter,jekyll,jwt,locale,login,mailout,minify,nobots,prometheus,proxyprotocol,ratelimit,realip,reauth,restic,upload,webdav"

RUN VERSION=${version} PLUGINS=${plugins} /bin/sh /usr/bin/builder.sh

#
# Final stage
#
FROM wener/caddy
LABEL maintainer="wener <wener@wener.me>"

# install caddy
COPY --from=builder /install/caddy /usr/bin/caddy

# validate install
RUN /usr/bin/caddy -version
RUN /usr/bin/caddy -plugins
