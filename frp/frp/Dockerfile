FROM wener/base

# inotify-tools help auto reload frp
RUN apk add frp inotify-tools  \
    && curl -LO https://ghproxy.com/github.com/fatedier/frp/releases/download/v0.51.0/frp_0.51.0_linux_amd64.tar.gz \
    && tar -zxvf frp_0.51.0_linux_amd64.tar.gz \
    && mv frp_0.51.0_linux_amd64/frps frp_0.51.0_linux_amd64/frpc /usr/bin/ \
    && rm -rf frp_0.51.0_linux_amd64*
