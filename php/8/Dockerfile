ARG ALPINE_RELEASE
FROM wener/nginx:${ALPINE_RELEASE}

RUN apk add icu-data-full # for replacing iconv

RUN apk --no-cache add \
    php82 \
    # Base package exclude cgi,litespeed,apache2,doc
    php82-{bcmath,bz2,calendar,common,ctype,curl,dev,dba,dom,embed,enchant,exif,fileinfo,fpm,ftp,gd,gettext,gmp,iconv,imap,intl,json,ldap,mbstring,mysqli,mysqlnd,odbc,opcache,openssl,pcntl,pdo,pdo_dblib,pdo_mysql,pdo_odbc,pdo_pgsql,pdo_sqlite,pear,pgsql,phar,phpdbg,posix,pspell,session,shmop,simplexml,snmp,soap,sockets,sodium,sqlite3,sysvmsg,sysvsem,sysvshm,tidy,tokenizer,xml,xmlreader,xmlwriter,xsl,zip,zlib} \
    # https://pkgs.alpinelinux.org/packages?name=php82-pecl-*&arch=x86_64
    php82-pecl-{redis,yaml,uuid,oauth,protobuf,igbinary,psr,zstd,mcrypt}

# www-data 组已经存在
RUN set -x adduser -u 82 -D -S -G www-data www-data

COPY root /
COPY 8.2/root /

WORKDIR /var/www/html

EXPOSE 80 8080

ENTRYPOINT ["/entrypoint.sh"]
