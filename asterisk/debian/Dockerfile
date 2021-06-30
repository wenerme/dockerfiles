FROM wener/debian

RUN apt update && apt install -t buster-backports -y \
  # core
  asterisk asterisk-opus asterisk-mp3 \
  # deps
  sqlite3 \
  && rm -rf /var/lib/apt/lists/*

# HTTP HTTPS AMI
EXPOSE 8088 8089 5038
# SIP signaling RTP audio
EXPOSE 5060-5070/udp
# 8766-35000/udp
# IAX2
EXPOSE 4568 4568/udp
