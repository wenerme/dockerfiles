# syntax=docker/dockerfile:1
ARG ALPINE_RELEASE
FROM wener/app:${ALPINE_RELEASE}-ssh

# System dependencies
RUN --mount=type=cache,target=/var/cache/apk apk add \
    bash-completion \
    bind-tools \
    docker-cli \
    docker-cli-buildx \
    docker-cli-compose \
    ccache \
    coreutils \
    crane \
    curl \
    diffutils \
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
    lsof \
    make \
    nodejs \
    npm \
    openssl \
    patch \
    pigz \
    procps-ng \
    rclone \
    ripgrep \
    rsync \
    sed \
    shadow \
    socat \
    sysstat \
    tar \
    tcpdump \
    tmux \
    tree \
    unzip \
    util-linux \
    wget \
    xxd \
    xz \
    yq-go \
    zip \
    && curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr/local bash

# Claude Code - install globally via npm
RUN npm add -g --ignore-scripts \
    pnpm \
    yarn \
    @anthropic-ai/claude-code  \
    @earendil-works/pi-coding-agent
