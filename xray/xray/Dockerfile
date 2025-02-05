ARG ALPINE_RELEASE
ARG VERSION

FROM ghcr.wener.me/xtls/xray-core:${VERSION} as base
FROM wener/base:${ALPINE_RELEASE}

COPY --from=base /usr/share/xray/geoip.dat /usr/share/xray/geoip.dat
COPY --from=base /usr/share/xray/geosite.dat /usr/share/xray/geosite.dat
COPY --from=base /usr/bin/xray /usr/bin/xray

CMD ["/usr/bin/xray","run", "-confdir", "/etc/xray"]
