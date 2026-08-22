ARG ALPINE_RELEASE=3.24.1

FROM wener/app:${ALPINE_RELEASE}-ssh

ARG TARGETARCH
ARG TARGETVARIANT

RUN --mount=type=cache,id=apk-${TARGETARCH}${TARGETVARIANT},sharing=locked,target=/etc/apk/cache set -eux; apk add --no-cache \
    bash \
    bash-completion \
    bind-tools \
    ccache \
    coreutils \
    crane \
    curl \
    diffutils \
    docker-cli \
    docker-cli-buildx \
    docker-cli-compose \
    fastfetch \
    fd \
    file \
    findutils \
    gawk \
    git \
    github-cli \
    glab \
    go \
    grep \
    gzip \
    htop \
    icu-data-full \
    jq \
    just \
    kitty-terminfo \
    lsof \
    make \
    mariadb-client \
    ncurses \
    ncurses-terminfo \
    nodejs \
    npm \
    openssl \
    patch \
    pigz \
    postgresql18-client \
    procps-ng \
    python3 \
    rclone \
    ripgrep \
    rsync \
    sed \
    shadow \
    sqlite \
    socat \
    sysstat \
    tar \
    tcpdump \
    tmux \
    tree \
    unzip \
    util-linux \
    uv \
    wget \
    xxd \
    xz \
    yq-go \
    zip \
		&& apk add --upgrade -X https://mirrors.aliyun.com/alpine/edge/community zellij \
    && apk add -X https://mirrors.aliyun.com/alpine/edge/testing duckdb \
    && curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr/local bash

RUN npm add -g \
    pnpm \
    yarn \
    @anthropic-ai/claude-code  \
    @earendil-works/pi-coding-agent \
		&& npm cache clean --force

COPY rootfs /
COPY workspace-setup.test.sh /tmp/workspace-setup.test.sh

RUN sh -n /etc/init.d/workspace-setup \
    && sh -n /usr/local/sbin/workspace-setup \
    && install -d /usr/share/workspace/rootfs/etc \
    && rm -f /etc/ssh/ssh_host_* \
    && cp -a /etc/ssh /usr/share/workspace/rootfs/etc/ssh \
    && sh /tmp/workspace-setup.test.sh \
    && rm /tmp/workspace-setup.test.sh \
    && rm -f /etc/ssh/ssh_host_* \
    && printf '%s\n' \
      '' \
      'rc_need="workspace-setup"' \
      'sshd_disable_keygen=yes' \
      >> /etc/conf.d/sshd \
    && printf '%s\n' 'rc_cgroup_mode="none"' >> /etc/rc.conf \
    && rc-update del machine-id sysinit \
    && rm -f /etc/init.d/acpid /etc/init.d/machine-id /etc/init.d/watchdog \
    && rc-update add workspace-setup sysinit \
    && ssh-keygen -A \
    && sshd -t \
    && rm -f /etc/ssh/ssh_host_* \
    && mkdir -p /workspace

WORKDIR /workspace
