FROM dreamacro/clash:v1.12.0 AS builder

FROM wener/base AS dash
RUN mkdir /dash  \
    && curl -Lso yacd.zip https://ghproxy.com/https://github.com/haishanh/yacd/archive/gh-pages.zip  \
    && unzip yacd.zip && mv yacd-gh-pages /dash/yacd  \
    && curl -Lso dashboard.zip https://ghproxy.com/https://github.com/Dreamacro/clash-dashboard/archive/gh-pages.zip \
    && unzip dashboard.zip && mv clash-dashboard-gh-pages /dash//dashboard


FROM wener/base

COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /root/.config/clash /root/.config/clash
COPY --from=builder /clash /usr/bin/clash
COPY --from=dash  /dash/ /root/.config/clash/

CMD ["/usr/bin/clash"]
