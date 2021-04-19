FROM wener/gitlab-runner

# Golang + Web dev
# Go 1.16 NPMv7
RUN apk add --no-cache nodejs yarn npm && npm install -g npm \
  && apk add go -X https://mirrors.aliyun.com/alpine/edge/community
