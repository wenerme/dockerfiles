FROM wener/node

# hybrid need glibc
RUN apk add --no-cache gcompat \
    && yarn global add webtorrent-hybrid webtorrent-cli
