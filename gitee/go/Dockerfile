FROM wener/java:8

COPY prepare.sh /
RUN /prepare.sh -s 'server' -u 'uuid'

COPY run.sh /


CMD [ "/run.sh" ]
