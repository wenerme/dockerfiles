FROM wener/php

# + 300MB
RUN apk add --no-cache docker docker-cli-buildx curl nano \
      # https://www.npmjs.com/package/node-gyp
      # + 200MB
      python3 make gcc g++ alpine-sdk \
      # dev
      git
RUN docker buildx install

RUN ln -s $(which php81) $(dirname $(which php81))/php
RUN php -r "copy('https://install.phpcomposer.com/installer', 'composer-setup.php');" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');" && \
    mv composer.phar /usr/local/bin/composer


ENTRYPOINT []
CMD ["/bin/bash"]
