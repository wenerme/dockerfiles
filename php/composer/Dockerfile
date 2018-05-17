FROM        wener/php

# 使用中国镜像安装
RUN php -r "copy('https://install.phpcomposer.com/installer', 'composer-setup.php');" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');" && \
    mv composer.phar /usr/local/bin/composer

# 使用中国镜像
RUN composer config -g repo.packagist composer https://packagist.phpcomposer.com
