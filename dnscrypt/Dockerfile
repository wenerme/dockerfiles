FROM wener/base

RUN apk add --no-cache dnscrypt-proxy dnscrypt-proxy-setup
RUN sed -i "s/listen_addresses.*/listen_addresses=['0.0.0.0:53']/" /etc/dnscrypt-proxy/dnscrypt-proxy.toml
RUN sed -i "s/require_dnssec.*/require_dnssec=true/" /etc/dnscrypt-proxy/dnscrypt-proxy.toml

CMD [ "dnscrypt-proxy", "-config", "/etc/dnscrypt-proxy/dnscrypt-proxy.toml" ]
