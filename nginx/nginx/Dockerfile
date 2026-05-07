ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

RUN apk --no-cache add \
        nginx \
        nginx-mod-stream nginx-mod-stream-js \
        nginx-mod-devel-kit \
        nginx-mod-http-{acme,brotli,cache-purge,dav-ext,echo,fancyindex,headers-more,js,lua,lua-upstream,set-misc,vts,zstd} \
    && chown -R nginx:www-data /var/lib/nginx \
    && mkdir -p /run/nginx/ \
    && mv /etc/nginx/modules/20_http_lua_upstream.conf /etc/nginx/modules/40_http_lua_upstream.conf
COPY root /

EXPOSE 80 443
STOPSIGNAL SIGQUIT
ENTRYPOINT ["/usr/sbin/nginx"]
CMD ["-g", "daemon off;"]
