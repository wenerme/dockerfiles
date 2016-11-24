FROM ubuntu:yakkety

MAINTAINER wener<wenermail@gmail.com>
# 使用阿里云镜像
RUN . /etc/lsb-release && \
    sed -i -e "s|^|\n\
    deb http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME main restricted universe multiverse \n\
    deb http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-security main restricted universe multiverse \n\
    deb http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-updates main restricted universe multiverse \n\
    deb http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-proposed main restricted universe multiverse \n\
    deb http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-backports main restricted universe multiverse \n\
    deb-src http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME main restricted universe multiverse \n\
    deb-src http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-security main restricted universe multiverse \n\
    deb-src http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-updates main restricted universe multiverse \n\
    deb-src http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-proposed main restricted universe multiverse \n\
    deb-src http://mirrors.aliyun.com/ubuntu/ $DISTRIB_CODENAME-backports main restricted universe multiverse \n|" /etc/apt/sources.list && \
    apt-get update
