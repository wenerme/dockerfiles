FROM wener/php

ENV COMPOSER_ALLOW_SUPERUSER 1
# 使用中国镜像安装
RUN php -r "copy('https://install.phpcomposer.com/installer', 'composer-setup.php');" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');" && \
    mv composer.phar /usr/local/bin/composer

# 使用中国镜像
RUN composer config -g repo.packagist composer https://packagist.phpcomposer.com

# 添加额外预编译模块
COPY modules/*.so /usr/lib/php7/modules/
COPY modules/*.ini /etc/php7/conf.d/
