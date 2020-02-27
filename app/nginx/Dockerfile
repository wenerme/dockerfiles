FROM wener/app

# https://pkgs.alpinelinux.org/packages?name=nginx-mod-*&branch=v3.11&arch=x86_64
RUN apk --no-cache add \
        nginx \
        # nginx-mod-http
        # copy($$('.package a').map(v=>v.innerText).filter(v=>v.startsWith('nginx-mod-http')).map(v=>v.replace(/^nginx-mod-http-/,'')).sort().join(','))
        nginx-mod-http-{cache-purge,echo,fancyindex,geoip,geoip2,headers-more,image-filter,js,lua,lua-upstream,nchan,perl,redis2,set-misc,shibboleth,upload-progress,upstream-fair,vod,xslt-filter} \
        # copy($$('.package a').map(v=>v.innerText).filter(v=>v.startsWith('nginx-mod-stream-')).map(v=>v.replace(/^nginx-mod-stream-/,'')).sort().join(','))
        nginx-mod-stream nginx-mod-stream-{geoip,geoip2,js} \
        # copy($$('.package a').map(v=>v.innerText).filter(v=>!(v.startsWith('nginx-mod-http') || v.startsWith('nginx-mod-stream'))).map(v=>v.replace(/^nginx-mod-/,'')).sort().join(','))
        nginx-mod-{devel-kit,mail,rtmp}

RUN chown -R nginx:www-data /var/lib/nginx && \
    mkdir -p /run/nginx/

RUN rc-update add nginx default

EXPOSE 80 443 443/udp
