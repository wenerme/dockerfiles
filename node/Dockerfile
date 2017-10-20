FROM        wener/base:bash
MAINTAINER  wener<wener@wener.me>

RUN apk add --no-cache yarn nodejs-npm && apk del nodejs-current
RUN npm config set registry https://registry.npm.taobao.org && \
    yarn config set registry https://registry.npm.taobao.org

CMD ["node"]
