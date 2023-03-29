FROM wener/nginx

RUN apk --no-cache add -X https://mirrors.sjtug.sjtu.edu.cn/alpine/edge/testing  \
    php81 \
    # Base package exclude cgi,litespeed,apache2,doc
    php81-{bcmath,bz2,calendar,common,ctype,curl,dev,dba,dom,embed,enchant,exif,fileinfo,fpm,ftp,gd,gettext,gmp,iconv,imap,intl,json,ldap,mbstring,mysqli,mysqlnd,odbc,opcache,openssl,pcntl,pdo,pdo_dblib,pdo_mysql,pdo_odbc,pdo_pgsql,pdo_sqlite,pear,pgsql,phar,phpdbg,posix,pspell,session,shmop,simplexml,snmp,soap,sockets,sodium,sqlite3,sysvmsg,sysvsem,sysvshm,tidy,tokenizer,xml,xmlreader,xmlwriter,xsl,zip,zlib} \
    # https://pkgs.alpinelinux.org/packages?name=php81-pecl-*&arch=x86_64
    php81-pecl-{redis,yaml,uuid,oauth,protobuf,igbinary,psr,zstd,mcrypt}

# https://github.com/docker-library/php/issues/240
RUN apk add --no-cache gnu-libiconv
ENV LD_PRELOAD /usr/lib/preloadable_libiconv.so php

# www-data 组已经存在
RUN set -x adduser -u 82 -D -S -G www-data www-data

COPY root /
COPY 81/root /

WORKDIR /var/www/html

EXPOSE 80 8080

ENTRYPOINT ["/entrypoint.sh"]
