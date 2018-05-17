FROM wener/ubuntu
LABEL org.label-schema.name="zentao" \
    org.label-schema.description="基于 Ubuntu 的禅道镜像" \
    org.label-schema.version="8.3.1"

RUN apt-get update
RUN apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

ENV ZENTAO_VERSION="8.3.1"
RUN wget -qO- http://dl.cnezsoft.com/zentao/$ZENTAO_VERSION/ZenTaoPMS.$ZENTAO_VERSION.zbox_64.tar.gz \
    | tar -zxC /opt

COPY ./entrypoint.sh /

VOLUME ["/opt/zbox/data"]
EXPOSE 80 3306
ENTRYPOINT ["sh", "entrypoint.sh"]
