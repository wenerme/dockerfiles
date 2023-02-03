FROM wener/base

RUN apk add --no-cache docker git make docker-cli-buildx  \
    && docker buildx use default  \
    && docker buildx install
