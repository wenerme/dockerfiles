FROM wener/base

RUN apk add --no-cache docker git make openssh \
  && apk add gitlab-runner -X https://mirrors.aliyun.com/alpine/edge/community

CMD ["/usr/bin/gitlab-runner","run"]
