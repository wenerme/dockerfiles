FROM wener/base:util

ENV NMAP_VERSION 7.40-r0
RUN apk add --no-cache nmap nmap-{ncat,nping,scripts,nselibs}=${NMAP_VERSION}

ENTRYPOINT [ "bash" ]
