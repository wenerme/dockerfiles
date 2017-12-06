FROM wener/node

RUN apk add --no-cache git
# dir must be src
RUN mkdir -p /opt/parsoid && \
    curl -sLO https://github.com/wikimedia/parsoid/archive/master.zip && \
    unzip master.zip -qd /opt/parsoid && \
    mv /opt/parsoid/parsoid-master /opt/parsoid/src

COPY patch/ /opt/parsoid/src
WORKDIR /opt/parsoid/src

RUN npm install --prod
RUN cp config.example.yaml config.yaml

EXPOSE 8000
ENTRYPOINT ["yarn","start"]
