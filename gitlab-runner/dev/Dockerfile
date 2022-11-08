FROM wener/gitlab-runner

# Golang + Web dev
# if need newer version, use go install
RUN apk add --no-cache nodejs yarn npm go && \
    npm install -g npm pnpm && \
    npm cache clean --force && \
    apk add --no-cache python3 g++ gcc make --virtual .gyp
