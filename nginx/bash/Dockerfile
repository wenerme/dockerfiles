FROM        wener/base:bash
MAINTAINER  wener<wener@wener.me>

RUN apk --no-cache add nginx-mod-http-lua && \
    chown -R nginx:www-data /var/lib/nginx && \
    mkdir -p /run/nginx/

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
