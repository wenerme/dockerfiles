FROM        wener/nginx:bash
MAINTAINER  wener<wener@wener.me>

RUN apk --no-cache add php5 &&\
    apk --no-cache add \
    # Base package exclude cgi,litespeed,apache2,doc
    # Missing fileinfo, mbstring,mysqlnd,recode,session,simplexml,tidy,tokenizer,xmlwriter
    php5-{bcmath,bz2,calendar,common,ctype,curl,dev,dba,dom,embed,enchant,exif,fpm,ftp,gd,gettext,gmp,iconv,imap,intl,json,ldap,mcrypt,mysqli,odbc,opcache,openssl,pcntl,pdo,pdo_dblib,pdo_mysql,pdo_odbc,pdo_pgsql,pdo_sqlite,pear,pgsql,phar,phpdbg,posix,pspell,shmop,snmp,soap,sockets,sqlite3,sysvmsg,sysvsem,sysvshm,wddx,xml,xmlreader,xmlrpc,xsl,zip,zlib}

# 如果执行了这一步, 会无法 install, 不知道为什么
# https://github.com/docker-library/php/issues/443
#RUN pecl update-channels && \
#    rm -rf /tmp/pear ~/.pearrc

# https://github.com/docker-library/php/issues/240
RUN apk add --no-cache --repository http://mirrors.aliyun.com/alpine/edge/testing gnu-libiconv
ENV LD_PRELOAD /usr/lib/preloadable_libiconv.so php

# Fixing
RUN \
    # After v3.5, the php is php7
    ln -s /usr/bin/php5 /usr/bin/php &&\
    # XML Extension not found
    sed -i "s|\-n||g" /usr/bin/pecl

# www-data 组已经存在
RUN set -x adduser -u 82 -D -S -G www-data www-data

COPY root /
COPY 5/root /

VOLUME ["/var/www/html"]
WORKDIR /var/www/html

COPY 5/entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
