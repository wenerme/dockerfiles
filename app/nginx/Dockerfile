FROM wener/app

RUN apk --no-cache add \
        # Http related module
        nginx-mod-http-{lua,geoip,echo,cache-purge,fancyindex,headers-more,lua-upstream,nchan,shibboleth,redis2,set-misc,upload-progress,upstream-fair} \
        # Other module
        nginx-mod-{stream,stream-geoip,rtmp}

RUN rc-update add nginx default

EXPOSE 80 443 443/udp
