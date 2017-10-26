FROM        wener/php:pecl
MAINTAINER  wener<wener@wener.me>

RUN apk add --no-cache gcc g++ autoconf automake make
RUN apk add --no-cache pkgconf openssl
RUN pecl update-channels && pecl install mongodb && echo "extension=mongodb.so" >> $(php7 --ini | grep "Loaded Configuration" | sed -e "s|.*:\s*||")
