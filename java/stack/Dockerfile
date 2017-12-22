FROM wener/java
MAINTAINER wener

RUN apk update && \
    apk upgrade -a && \
    apk add openssh openssh-sftp-server mosh git bash-completion \
            openssl libssl1.0 libcrypto1.0 \
            htop && \
    rm -rf /var/cache/apk/*

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 22

ENTRYPOINT ["/entrypoint.sh"]
