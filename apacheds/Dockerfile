FROM wener/java
MAINTAINER wener<wener AT wener.me>

ENV APACHEDS_VERSION 2.0.0-M24

ENV APACHEDS_INSTANCE default
ENV APACHEDS_BOOTSTRAP /bootstrap
ENV APACHEDS_DATA /opt/apacheds/instances

RUN curl -sLO http://mirrors.aliyun.com/apache/directory/apacheds/dist/${APACHEDS_VERSION}/apacheds-${APACHEDS_VERSION}.zip && \
    unzip apacheds-${APACHEDS_VERSION}.zip && \
    mkdir /opt && mv apacheds-${APACHEDS_VERSION} /opt/apacheds && \
    # Backup default instance data
    cp -r /opt/apacheds/instances/default ${APACHEDS_BOOTSTRAP} && \
    rm apacheds-${APACHEDS_VERSION}.zip && \
    chmod +x /opt/apacheds/bin/apacheds.sh

RUN apk add --no-cache openldap-clients=2.4.44-r5

# Ports defined by the default instance configuration:
# 10389: ldap
# 10636: ldaps
# 60088: kerberos
# 60464: changePasswordServer
# 8080: http
# 8443: https
EXPOSE 10389 10636 60088 60464 8080 8443
VOLUME ${APACHEDS_DATA}

WORKDIR /opt/apacheds

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
