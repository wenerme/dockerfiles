FROM wener/base

# AMDv3
RUN --mount=type=cache,target=/tmp \
    cd /tmp \
    && curl -sLOC- https://github.com/MetaCubeX/Clash.Meta/releases/download/v1.16.0/clash.meta-linux-amd64-compatible-v1.16.0.gz \
    && apk add 7zip \
    && setup-timezone Asia/Shanghai \
    && 7z -y x clash.meta-linux-amd64-compatible-v1.16.0.gz \
    && mv clash.meta-linux-amd64-compatible /usr/bin/clash \
    && chmod +x /usr/bin/clash \
    && clash -v

CMD ["/usr/bin/clash"]
