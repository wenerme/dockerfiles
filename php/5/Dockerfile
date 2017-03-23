FROM        wener/nginx
MAINTAINER  wener<wener@wener.me>

# Use bash as default shell
RUN apk --no-cache add bash && \
    mv /bin/sh /bin/ash && \
    ln -s /bin/bash /bin/sh

RUN apk --no-cache add php5 &&\
    apk --no-cache add \
    php5-{bz2,calendar,ctype,curl,dom,exif,ftp,gd,gettext,gmp,iconv,json,ldap,memcache,mysql,mysqli} \
    php5-{odbc,openssl,pcntl,pdo,pdo_mysql,pdo_odbc,pdo_sqlite,phar,posix,shmop,snmp,soap,sockets,sqlite3,sysvmsg} \
    php5-{sysvsem,sysvshm,wddx,xml,xmlreader,xmlrpc,xsl,zip,zlib} \
    php5-fpm

COPY root /
COPY 5/root /

VOLUME ["/var/www/html"]
WORKDIR /var/www/html

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
