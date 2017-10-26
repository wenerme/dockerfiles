FROM        wener/nginx:bash
MAINTAINER  wener<wener@wener.me>

RUN apk --no-cache add php7 &&\
    apk --no-cache add \
    # Base package exclude cgi,litespeed,apache2,dev,doc
    php7-{bcmath,bz2,calendar,common,ctype,curl,dba,dom,embed,enchant,exif,fileinfo,fpm,ftp,gd,gettext,gmp,iconv,imap,intl,json,ldap,mbstring,mcrypt,mysqli,mysqlnd,odbc,opcache,openssl,pcntl,pdo,pdo_dblib,pdo_mysql,pdo_odbc,pdo_pgsql,pdo_sqlite,pear,pgsql,phar,phpdbg,posix,pspell,recode,session,shmop,simplexml,snmp,soap,sockets,sqlite3,sysvmsg,sysvsem,sysvshm,tidy,tokenizer,wddx,xml,xmlreader,xmlrpc,xmlwriter,xsl,zip,zlib}

COPY root /
COPY 7/root /

VOLUME ["/var/www/html"]
WORKDIR /var/www/html

COPY 7/entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
