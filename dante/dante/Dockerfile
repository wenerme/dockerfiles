FROM wener/base
MAINTAINER  wener<wener@wener.me>

RUN apk add --no-cache -X http://mirrors.aliyun.com/alpine/edge/testing dante dante-server
RUN cp /etc/sockd.conf /etc/sockd.sample.conf
COPY sockd.conf /etc

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

EXPOSE 8888 7777

ENTRYPOINT ["/entrypoint.sh"]
