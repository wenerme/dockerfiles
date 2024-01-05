FROM wener/base

# https://github.com/fatedier/frp/releases
ARG VERSION

# inotify-tools help auto reload frp
RUN apk add --no-cache inotify-tools
RUN test -n "$VERSION" \
    && apk add frp  \
    && echo Building ${VERSION} \
    && curl -LO https://mirror.ghproxy.com/github.com/fatedier/frp/releases/download/v${VERSION}/frp_${VERSION}_linux_amd64.tar.gz \
    && tar -zxvf frp_${VERSION}_linux_amd64.tar.gz \
    && mv frp_${VERSION}_linux_amd64/frps frp_${VERSION}_linux_amd64/frpc /usr/bin/ \
    && rm -rf frp_${VERSION}_linux_amd64*
