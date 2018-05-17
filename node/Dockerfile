FROM        wener/base:bash

RUN apk add --no-cache nodejs yarn nodejs-npm && \
    apk add --no-cache paxctl && paxctl -cm `which node` && apk del --no-cache paxctl
RUN npm config set registry https://registry.npm.taobao.org && \
    yarn config set registry https://registry.npm.taobao.org
