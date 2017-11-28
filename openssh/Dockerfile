FROM wener/base:util
MAINTAINER wener

RUN apk add --no-cache openssh openssh-sftp-server

ENV PASSWORD ""

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 22

ENTRYPOINT ["/entrypoint.sh"]
