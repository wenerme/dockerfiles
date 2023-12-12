FROM wener/base

RUN apk add --no-cache \
    dnsmasq-dnssec dnsmasq-utils bind-tools

EXPOSE 53 53/udp 80 5380

# dnsmasq -d -C /etc/dnsmasq.conf
CMD [ "dnsmasq", "-d", "-C", "/etc/dnsmasq.conf" ]
