# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
ARG ALPINE_RELEASE=3.19.1
FROM wener/node:${NODE_VERSION}

ARG TARGETARCH
ARG TARGETVARIANT

# Install development tools and database clients
RUN --mount=type=cache,id=apk-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
    apk add \
        # Build tools
        build-base \
        git \
        curl \
        wget \
        # Database clients
        postgresql-client \
        redis \
        # Development utilities
        bash \
        zsh \
        vim \
        nano \
        htop \
        tree \
        jq \
        # SSL/TLS
        ca-certificates \
        openssl

# Install Atlas CLI for database migrations
RUN --mount=type=cache,target=/tmp/atlas \
    curl -sSf https://atlasgo.sh | sh

# Install global development tools
RUN --mount=type=cache,target=/root/.npm/ \
    npm install -g \
        tsx \
        @types/node \
        typescript \
        nodemon \
        concurrently

# Set up shell environment
SHELL ["/bin/zsh", "-c"]
RUN echo 'export PATH="$PATH:/usr/local/bin"' >> /root/.zshrc

WORKDIR /workspace

# Keep container running
CMD ["sleep", "infinity"]