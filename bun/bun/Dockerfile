FROM wener/base as builder

ARG BUN_VERSION

RUN mkdir -p /tmp && cd /tmp && \
    curl -LO https://ghproxy.com/https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-linux-x64.zip && \
    unzip bun-linux-x64.zip && \
    mkdir /out && \
    mv bun-linux-x64/bun /out

FROM wener/debian

COPY --from=builder /out/bun /usr/local/bin/bun
