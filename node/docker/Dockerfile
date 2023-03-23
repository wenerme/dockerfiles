# syntax=docker/dockerfile:1

FROM wener/node

# + 300MB
RUN apk add --no-cache docker docker-cli-buildx curl nano \
      # https://www.npmjs.com/package/node-gyp
      # + 200MB
      python3 make gcc g++ alpine-sdk \
      # dev
      git jq coreutils findutils util-linux sed grep

# buildx -> build
# RUN docker buildx install
