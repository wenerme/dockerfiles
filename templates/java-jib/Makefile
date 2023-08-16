export DOCKER_REGISTRY_USERNAME
export DOCKER_REGISTRY_PASSWORD

build:
	./mvnw install -DskipTest -U -s ./settings.xml \
		-pl me.wener:server \
		-am -Pci
build\:*:
	./mvnw install -DskipTest -U -s ./settings.xml \
		-pl me.wener:$(*) \
		-am -Pci

image:
	DOCKER_IMAGE_TAG=$(GIT_COMMIT_SHORT) \
	echo No need to build

push:
	GIT_COMMIT_SHORT=$(GIT_COMMIT_SHORT) \
		./mvnw jib:build -Djib.console=plain -Djib.applicationCache=/cache/jib/application -Djib.baseImageCache=/cache/jib/base-image \
		-pl me.wener:server \
		-s ./settings.xml


clean:
	./mvnw clean

