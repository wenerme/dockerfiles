FROM ubuntu:yakkety

MAINTAINER wener<wenermail@gmail.com>
# 使用阿里云镜像
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
    | cat - /etc/apt/sources.list | tee /etc/apt/sources.list > /dev/null \
