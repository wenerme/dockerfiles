FROM wener/asterisk

RUN apk add --no-cache asterisk-{alsa,cdr-mysql,chan-dongle,curl,dahdi,dbg,dev,doc,fax,mobile,odbc,pgsql,sample-config,sounds-en,sounds-moh,speex,srtp,tds}

# HTTP HTTPS AMI
EXPOSE 8088 8089 5038
# SIP signaling RTP audio
EXPOSE  5060-5070 5060-5070/udp
# Too much ports - not wise
# EXPOSE 8766-35000/udp

ENTRYPOINT []
