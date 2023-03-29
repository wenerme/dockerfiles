# syntax=docker/dockerfile:1

FROM wener/php:7

# 使用中国镜像安装
RUN php -r "copy('https://install.phpcomposer.com/installer', 'composer-setup.php');" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');" && \
    mv composer.phar /usr/local/bin/composer

# https://repo.packagist.org/mirrors
RUN composer config -g repos.packagist composer https://packagist.pages.dev
