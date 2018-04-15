FROM        wener/nginx:bash
MAINTAINER  wener<wener@wener.me>

RUN apk --no-cache add \
        # Http related module
        nginx-mod-http-{lua,geoip,echo,cache-purge,fancyindex,headers-more,lua-upstream,nchan,shibboleth,redis2,set-misc,upload-progress,upstream-fair} \
        # Other module
        nginx-mod-{stream,stream-geoip,rtmp}

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
