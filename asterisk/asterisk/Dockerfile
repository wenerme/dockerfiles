FROM wener/base:bash
MAINTAINER wener

RUN apk add --no-cache asterisk openssl && \
    apk add --no-cache asterisk-{curl,pgsql,sample-config,sounds-en,sounds-moh,srtp}

# HTTP HTTPS AMI
EXPOSE 8088 8089 5038
# SIP signaling RTP audio
EXPOSE 5060-5070/udp 8766-35000/udp
