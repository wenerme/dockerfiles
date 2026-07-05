ARG ALPINE_RELEASE=3.24.1
FROM wener/base:${ALPINE_RELEASE}

ARG TARGETARCH
ARG TARGETVARIANT

#ARG ALPINE_MIRROR=https://mirrors.sjtug.sjtu.edu.cn/alpine

RUN echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/main > /etc/apk/repositories; \
    echo ${ALPINE_MIRROR}/v${ALPINE_VERSION}/community >> /etc/apk/repositories

# let pkgs='alpine-sdk bash binutils ca-certificates coreutils curl docker docker-cli-buildx dumb-init file findutils g++ gcc gcompat git go grep jq libc6-compat libgcc libstdc++ linux-headers make musl-dev ncurses nodejs npm openssh openssl pkgconf python3 rclone rsync sed tini util-linux yarn yq pkgconf cairo-dev pango-dev libpng-dev jpeg-dev giflib-dev librsvg-dev'; copy(Array.from(new Set(pkgs.split(/\s+/))).sort().join(' \\\n\t'))
RUN --mount=type=cache,id=apk-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
    apk add alpine-sdk \
            	bash \
            	binutils \
            	ca-certificates \
            	cairo-dev \
            	coreutils \
            	curl \
            	docker \
            	docker-cli-buildx \
            	dumb-init \
            	file \
            	findutils \
            	g++ \
            	gcc \
            	gcompat \
            	giflib-dev \
            	git \
            	go \
            	grep \
            	jpeg-dev \
            	jq \
            	libc6-compat \
            	libgcc \
            	libpng-dev \
            	librsvg-dev \
            	libstdc++ \
            	linux-headers \
            	make \
            	musl-dev \
            	ncurses \
            	nodejs \
            	npm \
            	openssh \
            	openssl \
            	pango-dev \
            	pkgconf \
            	python3 \
            	rclone \
            	rsync \
            	sed \
            	tini \
            	util-linux \
            	yarn \
            	yq

# nodejs
# ENV N_NODE_MIRROR=https://npmmirror.com/mirrors/node-unofficial-builds
# ENV N_PREFIX=/opt/n
# RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n | bash -s -- --arch x64-musl lts
# /etc/npmrc
# RUN npm config -g set registry https://registry.npmmirror.com
# RUN npm add -g n pnpm && npm cache clean --force

RUN npm add -g n pnpm

# COPY rootfs /
