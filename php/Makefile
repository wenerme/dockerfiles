
push:
	docker buildx bake --push

mod-prepare:
	docker run -d -it --name php-builder wener/php:builder

mod-build:
	# Download from pear may need proxy
	docker exec -i php-builder pecl install -o -f redis <<<no
	docker exec -i php-builder pecl install -o -f mongodb
	docker exec -i php-builder pecl install -o -f grpc
	docker exec -i php-builder pecl install -o -f protobuf

mod-dist:
	mkdir modules
	MODULE="mongodb redis grpc protobuf"
	for i in $MODULE; do docker cp php-builder:/usr/lib/php7/modules/$i.so modules/; done;
	rm modules/extra.ini
	for i in $MODULE; do echo "extension=$i.so" >> modules/extra.ini; done;
