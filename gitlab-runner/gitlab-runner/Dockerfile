FROM wener/base

RUN apk add --no-cache dumb-init docker git make openssh gitlab-runner
RUN apk add --no-cache docker-cli-buildx && docker buildx use default && docker buildx install

ENTRYPOINT ["/usr/bin/dumb-init", "/usr/bin/gitlab-runner"]
CMD ["run"]
