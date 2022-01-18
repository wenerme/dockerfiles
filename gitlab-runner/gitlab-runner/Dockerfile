FROM wener/base

RUN apk add --no-cache dumb-init docker git make openssh gitlab-runner

ENTRYPOINT ["/usr/bin/dumb-init", "/usr/bin/gitlab-runner"]
CMD ["run"]
