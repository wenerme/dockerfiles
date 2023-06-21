#!/bin/sh
set -e

cat << EOF > /etc/dnsmasq.d/main.conf
server=223.5.5.5
no-resolv
EOF

: ${FAKEIP:=172.32.1.1}
[ -z "$FAKEIP" ] ||  {
  echo "Using fake ip: $FAKEIP"
  cat /opt/gfwlist.txt| sed -E "s#.+#address=/&/$FAKEIP#" > /etc/dnsmasq.d/gfwlist.conf
}


dnsmasq -d &
GOST_FLAGS="-L sni://:80 -L sni://:443"
[ -z "$PROXY" ] || {
  echo "Using proxy: $PROXY"
  GOST_FLAGS="$GOST_FLAGS -F $PROXY"
}
gost $GOST_FLAGS
