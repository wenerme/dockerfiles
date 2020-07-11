FROM wener/base

RUN apk add --no-cache --update autossh sshpass openssh

# Password for ssh
ENV SSHPASS ''
# SSH command will run
ENV SSH_COMMANDS ''

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
