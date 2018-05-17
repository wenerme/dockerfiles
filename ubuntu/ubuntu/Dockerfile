FROM ubuntu:xenial

LABEL maintainer="wener@wener.me"\
    org.label-schema.name="ubuntu" \
    org.label-schema.vendor="Wener" \
    org.label-schema.description="Ubuntu with Chinese mirror" \
    org.label-schema.url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.version="3.7" \
    org.label-schema.license="MIT"

# Use aliyun ubuntu mirrors to replace original sources.list
RUN . /etc/lsb-release && \
    echo "# Use Aliyun ubuntu mirror \n\
deb http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME main restricted universe multiverse \n\
deb http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-security main restricted universe multiverse \n\
deb http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-updates main restricted universe multiverse \n\
deb http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-proposed main restricted universe multiverse \n\
deb http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-backports main restricted universe multiverse \n\
deb-src http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME main restricted universe multiverse \n\
deb-src http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-security main restricted universe multiverse \n\
deb-src http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-updates main restricted universe multiverse \n\
deb-src http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-proposed main restricted universe multiverse \n\
deb-src http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-backports main restricted universe multiverse \n" \
    | tee /etc/apt/sources.list > /dev/null
# Prepend instead of replace, first update is very slow!
#    | cat - /etc/apt/sources.list | tee /etc/apt/sources.list > /dev/null

RUN apt-get update && apt-get install -y \
    nano \
    && rm -rf /var/lib/apt/lists/*
COPY root /
