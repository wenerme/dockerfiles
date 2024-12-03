ARG ALPINE_RELEASE
FROM wener/nginx:alpine-${ALPINE_RELEASE}

RUN apk add icu-data-full # for replacing iconv

# https://pkgs.alpinelinux.org/packages?name=php84-pecl-*&arch=x86_64
# for composer
# apk add php84-{openssl,phar,iconv,mbstring,curl} gnu-libiconv
RUN apk --no-cache add \
    php84 \
    # Base package exclude cgi,litespeed,apache2,doc
    php84-{bcmath,bz2,calendar,common,ctype,curl,dev,dba,dom,embed,enchant,exif,fileinfo,fpm,ftp,gd,gettext,gmp,iconv,imap,intl,json,ldap,mbstring,mysqli,mysqlnd,odbc,opcache,openssl,pcntl,pdo,pdo_dblib,pdo_mysql,pdo_odbc,pdo_pgsql,pdo_sqlite,pear,pgsql,phar,phpdbg,posix,pspell,session,shmop,simplexml,snmp,soap,sockets,sodium,sqlite3,sysvmsg,sysvsem,sysvshm,tidy,tokenizer,xml,xmlreader,xmlwriter,xsl,zip,zlib} \
    php84-pecl-{redis,yaml,uuid,protobuf,igbinary,zstd,grpc} \
    make

RUN ln -s $(which php84) /usr/bin/php || true
RUN ln -s $(which php-fpm84) /usr/bin/php-fpm || true

# www-data 组已经存在
RUN set -x adduser -u 82 -D -S -G www-data www-data

COPY root /
COPY 8.4/root /

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
