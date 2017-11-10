#!/usr/bin/env bash

docker run -d -it --name php-builder wener/php:builder
# Build redis
# Download from pear may need proxy
docker exec -i php-builder pecl install -o -f redis <<<no
docker exec -i php-builder pecl install -o -f mongodb
docker exec -i php-builder pecl install -o -f grpc

# Build with module
mkdir modules
for i in {mongodb,redis,grpc}; do docker cp php-builder:/usr/lib/php7/modules/$i.so modules/; done;
for i in {mongodb,redis,grpc}; do echo "extension=$i.so" >> modules/extra.ini; done;

# Build image
BUILD_SKIP_PUSH=1 ./build.sh app
# Validate
docker run --rm -it --entrypoint php wener/php:app -m | grep grpc
