FROM wener/nginx

# https://pkgs.alpinelinux.org/packages?name=php82-pecl-*&arch=x86_64
RUN apk --no-cache add \
    php82 \
    # Base package exclude cgi,litespeed,apache2,doc
    php82-{bcmath,bz2,calendar,common,ctype,curl,dev,dba,dom,embed,enchant,exif,fileinfo,fpm,ftp,gd,gettext,gmp,iconv,imap,intl,json,ldap,mbstring,mysqli,mysqlnd,odbc,opcache,openssl,pcntl,pdo,pdo_dblib,pdo_mysql,pdo_odbc,pdo_pgsql,pdo_sqlite,pear,pgsql,phar,phpdbg,posix,pspell,session,shmop,simplexml,snmp,soap,sockets,sodium,sqlite3,sysvmsg,sysvsem,sysvshm,tidy,tokenizer,xml,xmlreader,xmlwriter,xsl,zip,zlib} \
    php82-pecl-{redis,yaml,uuid,protobuf,igbinary,psr,zstd}

RUN ln -s $(which php82) /usr/bin/php || true

# https://github.com/docker-library/php/issues/240
RUN apk add --no-cache gnu-libiconv
ENV LD_PRELOAD /usr/lib/preloadable_libiconv.so php

# www-data 组已经存在
RUN set -x adduser -u 82 -D -S -G www-data www-data

COPY root /
COPY 8.2/root /

# 使用中国镜像安装
RUN php -r "copy('https://install.phpcomposer.com/installer', 'composer-setup.php');" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');" && \
    mv composer.phar /usr/local/bin/composer

# https://repo.packagist.org/mirrors
RUN composer config -g repos.packagist composer https://packagist.pages.dev


WORKDIR /var/www/html

EXPOSE 80 8080

ENTRYPOINT ["/entrypoint.sh"]
