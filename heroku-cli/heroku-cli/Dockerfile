FROM node:12-alpine

RUN echo https://mirrors.aliyun.com/alpine/v$(sed -n 's/\.\d\+$//p' /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo https://mirrors.aliyun.com/alpine/v$(sed -n 's/\.\d\+$//p' /etc/alpine-release)/community/ >> /etc/apk/repositories

RUN apk add --no-cache curl bash && curl https://cli-assets.heroku.com/install.sh | sh

ENTRYPOINT bash
