FROM wener/base

RUN apk add --no-cache --update \
      openldap  \
      openldap-clients \
      openldap-backend-all \
      openldap-overlay-all \
      openldap-passwd-{pbkdf2,argon2,sha2} \
    && rm -f /etc/openldap/slapd.conf

COPY docker-entrypoint.sh /bin/docker-entrypoint.sh
COPY start-slapd.sh /bin/start-slapd.sh

EXPOSE 389 636

ENTRYPOINT ["/bin/docker-entrypoint.sh"]
CMD ["start-slapd.sh"]
