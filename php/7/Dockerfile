FROM        wener/nginx
MAINTAINER  wener<wener@wener.me>

# Use bash as default shell
RUN apk --no-cache add bash && \
    mv /bin/sh /bin/ash && \
    ln -s /bin/bash /bin/sh

RUN apk --no-cache add php7 &&\
    apk --no-cache add \
    php7-{bz2,calendar,ctype,curl,dom,exif,ftp,gd,gettext,gmp,iconv,json,ldap,mysqlnd,mysqli} \
    php7-{odbc,openssl,pcntl,pdo,pdo_mysql,pdo_odbc,pdo_sqlite,phar,posix,shmop,snmp,soap,sockets,sqlite3,sysvmsg} \
    php7-{sysvsem,sysvshm,wddx,xml,xmlreader,xmlrpc,xsl,zip,zlib} \
    php7-fpm

COPY root /
COPY 7/root /

VOLUME ["/var/www/html"]
WORKDIR /var/www/html

COPY 7/entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
