FROM wener/base

RUN --mount=type=cache,target=/tmp \
    cd /tmp \
    && curl -sfLOC- https://github.com/MetaCubeX/Clash.Meta/releases/download/v1.16.0/clash.meta-linux-amd64-v1.16.0.gz \
    && apk add 7zip \
    && setup-timezone Asia/Shanghai \
    && 7z x clash.meta-linux-amd64-v1.16.0.gz \
    && mv clash.meta-linux-amd64 /usr/bin/clash \
    && chmod +x /usr/bin/clash \
    && clash -v

CMD ["/usr/bin/clash"]
