FROM wener/nginx

RUN apk --no-cache add php81 &&\
    apk --no-cache add \
    # Base package exclude cgi,litespeed,apache2,doc
    php81-{bcmath,bz2,calendar,common,ctype,curl,dev,dba,dom,embed,enchant,exif,fileinfo,fpm,ftp,gd,gettext,gmp,iconv,imap,intl,json,ldap,mbstring,mysqli,mysqlnd,odbc,opcache,openssl,pcntl,pdo,pdo_dblib,pdo_mysql,pdo_odbc,pdo_pgsql,pdo_sqlite,pear,pgsql,phar,phpdbg,posix,pspell,session,shmop,simplexml,snmp,soap,sockets,sqlite3,sysvmsg,sysvsem,sysvshm,tidy,tokenizer,xml,xmlreader,xmlwriter,xsl,zip,zlib}

# 如果执行了这一步, 会无法 install, 不知道为什么
# https://github.com/docker-library/php/issues/443
#RUN pecl update-channels && \
#    rm -rf /tmp/pear ~/.pearrc

# https://github.com/docker-library/php/issues/240
RUN apk add --no-cache gnu-libiconv
ENV LD_PRELOAD /usr/lib/preloadable_libiconv.so php

# www-data 组已经存在
RUN set -x adduser -u 82 -D -S -G www-data www-data

COPY root /
COPY 81/root /

VOLUME ["/var/www/html"]
WORKDIR /var/www/html

EXPOSE 80 8080

ENTRYPOINT ["/entrypoint.sh"]
