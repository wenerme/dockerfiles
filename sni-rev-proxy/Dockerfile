FROM wener/base as builder

RUN mkdir -p /opt && cd /opt/  \
    && curl -LO https://ghproxy.com/github.com/go-gost/gost/releases/download/v3.0.0-rc8/gost_3.0.0-rc8_linux_amd64.tar.gz \
    && tar zxvf gost*.tar.gz \
    && ls -lash

FROM wener/base

RUN apk add dnsmasq
COPY --from=builder /opt/gost /usr/local/bin

RUN mkdir -p /opt && cd /opt/ && curl -LO https://ghproxy.com/raw.githubusercontent.com/wenerme/wener/master/notes/service/dns/gfwlist.txt
RUN cat /opt/gfwlist.txt | sed -E 's#.+#address=/&/172.32.1.1#' > /etc/dnsmasq.d/gfwlist.conf

COPY entrypoint.sh /

ENTRYPOINT [ "/entrypoint.sh" ]
EXPOSE 80 443 53 53/udp
