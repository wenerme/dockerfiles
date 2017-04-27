FROM        wener/base:edge
MAINTAINER  wener<wener@wener.me>

RUN apk add --no-cache --update sshpass

# Password for ssh
ENV SSHPASS ''
# SSH command will run
ENV SSH_COMMANDS ''

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
