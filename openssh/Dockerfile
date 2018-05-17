FROM wener/base:util

RUN apk add --no-cache openssh openssh-sftp-server

ENV PASSWORD ""

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 22

ENTRYPOINT ["/entrypoint.sh"]
