FROM wener/node

# + 300MB
RUN apk add --no-cache docker docker-cli-buildx curl nano \
      # https://www.npmjs.com/package/node-gyp
      # + 200MB
      python3 make gcc g++ alpine-sdk \
      # dev
      git
RUN docker buildx install
