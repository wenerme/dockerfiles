FROM ubuntu

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

RUN  apt-get install -y wget \
  && rm -rf /var/lib/apt/lists/*

ENV ZENTAO_VERSION="8.3.1"
RUN wget -qO- http://dl.cnezsoft.com/zentao/$ZENTAO_VERSION/ZenTaoPMS.$ZENTAO_VERSION.zbox_64.tar.gz \
    | tar -zxvC /opt

COPY ./entrypoint.sh /

VOLUME ["/opt/zbox/data"]
EXPOSE 80 3306
ENTRYPOINT ["sh", "entrypoint.sh"]
