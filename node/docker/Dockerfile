FROM node:12-alpine

RUN echo https://mirrors.aliyun.com/alpine/v$(sed -n 's/\.\d\+$//p' /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo https://mirrors.aliyun.com/alpine/v$(sed -n 's/\.\d\+$//p' /etc/alpine-release)/community/ >> /etc/apk/repositories
# + 300MB
RUN apk add --no-cache docker curl nano \
      # https://www.npmjs.com/package/node-gyp
      # + 200MB
      python3 make gcc g++ alpine-sdk \
      # dev
      git
