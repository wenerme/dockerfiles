#!/bin/sh
set -e

# By default we allow all and do not send Via
sed -i -e 's/^Allow/#Allow/' -e 's/^ConnectPort/#ConnectPort/g'  /etc/tinyproxy/tinyproxy.conf
echo DisableViaHeader Yes >> /etc/tinyproxy/tinyproxy.conf

[ -z "$PORT" ] || sed -ire "s/^Port.*/Port $PORT/" /etc/tinyproxy/tinyproxy.conf

tinyproxy -d
