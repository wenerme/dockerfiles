ARG ALPINE_RELEASE=3.24.1
FROM wener/base:${ALPINE_RELEASE}

ARG TARGETARCH
ARG TARGETVARIANT
ARG REV=0

RUN --mount=type=cache,id=apk-${TARGETARCH}${TARGETVARIANT},sharing=locked,target=/etc/apk/cache \
    apk add --no-cache \
        bash \
        ca-certificates \
        coreutils \
        curl \
        diffutils \
        fd \
        file \
        findutils \
        git \
        grep \
        gzip \
        icu-data-full \
        jq \
        make \
        nodejs \
        npm \
        openssh-client \
        patch \
        procps-ng \
        python3 \
        ripgrep \
        sed \
        tar \
        unzip \
        uv \
        wget \
        yq-go \
    && npm add -g \
        @anthropic-ai/claude-code \
        @earendil-works/pi-coding-agent \
    && npm cache clean --force \
    && ln -sf /usr/bin/python3 /usr/local/bin/python \
    && claude --version \
    && pi --version \
    && python --version \
    && uv --version

WORKDIR /workspace
CMD ["/bin/bash", "-l"]
