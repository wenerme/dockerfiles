FROM wener/app:dns


RUN rc-update add dnsmasq default \
    && rc-update add pdns-recursor default \
    && sed -i -e 's/^[.]$//' /etc/init.d/dnsmasq

COPY ifup-lo0.start /etc/local.d
COPY interfaces /etc/network
COPY recursor.conf /etc/pdns
COPY dnsmasq.conf /etc
COPY resolv.dnsmasq.conf /etc
