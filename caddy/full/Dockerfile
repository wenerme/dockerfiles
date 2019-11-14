#
# Builder
#
FROM abiosoft/caddy:builder as builder
# minify,
ARG version="0.11.1"
ARG plugins="\
    # HTTP Plugins \
    authz,awses,awslambda,cache,cgi,cors,datadog,expires,filemanager,filter,forwardproxy,git,gopkg,grpc,hugo,ipfilter,jekyll,jwt,locale,login,mailout,nobots,prometheus,proxyprotocol,ratelimit,realip,reauth,restic,upload,webdav,\
    # TLS DNS Provider \
    auroradns,azure,cloudflare,cloudxns,digitalocean,dnsimple,dnsmadeeasy,dnspod,duckdns,dyn,exoscale,fastdns,gandi,gandiv5,glesys,godaddy,googlecloud,lightsail,linode,namecheap,namedotcom,ns1,otc,ovh,pdns,rackspace,rfc2136,route53,vultr"

RUN VERSION=${version} PLUGINS=${plugins} /bin/sh /usr/bin/builder.sh

#
# Final stage
#
FROM wener/caddy
LABEL org.label-schema.name="caddy:full" \
    org.label-schema.description="Caddy will almost all plugins and dns providers"

RUN apk add --no-cache openssh-client git

# install caddy
COPY --from=builder /install/caddy /usr/bin/caddy

# validate install
RUN /usr/bin/caddy -version
RUN /usr/bin/caddy -plugins
