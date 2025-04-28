#!/bin/sh
set -e

[ -z "$PORT" ] || sed -ire "s/^Port.*/Port $PORT/" /etc/tinyproxy/tinyproxy.conf

[ -z "$CONF" ] || echo "$CONF" > /etc/tinyproxy/tinyproxy.conf

tinyproxy -d
