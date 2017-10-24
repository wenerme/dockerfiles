FROM wener/base:bash
MAINTAINER wener

RUN apk add --no-cache openssh

ENV PASSWORD ""

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 22

ENTRYPOINT ["/entrypoint.sh"]
