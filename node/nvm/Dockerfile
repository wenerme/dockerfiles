FROM wener/base

RUN apk add --no-cache sudo \
    # admin account - disable login but enable sudo
    && adduser -D admin \
    # NOPASSWORD
    && echo 'admin ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    # unlock user - use same ts to prevent unneed change
    && sed -i -re 's/^admin:.:\d+/admin:*:18000/' /etc/shadow \
    && cp /root/.bashrc ~admin/ && chown admin:admin ~admin/.bashrc \
    # https://github.com/nvm-sh/nvm#installing-nvm-on-alpine-linux
    # alpine requirement - build from source
    && apk add --no-cache libc6-compat gcompat curl bash ca-certificates openssl ncurses coreutils python2 make gcc g++ libgcc linux-headers grep util-linux binutils findutils

USER admin

# install nvm for non root
RUN curl -f -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
# install lts from source
RUN source ~/.bashrc && nvm install -s --lts && nvm use --lts && nvm alias default stable && nvm cache clear

# use for root
# https://github.com/nvm-sh/nvm/issues/43#issuecomment-139739406
