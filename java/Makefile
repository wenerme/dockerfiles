JAVA_8_VERSION ?= $(shell docker run --rm -it wener/base sh -c 'apk update >/dev/null;apk policy openjdk8 | sed "2!d"  | sed -r "s/^\s*([0-9.]+).*/\1/"')

info:
	@echo JAVA_8_VERSION=$(JAVA_8_VERSION)

java-8:
	VERSION=$(JAVA_8_VERSION) docker buildx bake --push 8 8-ui

ma-8:
	docker buildx build --push --platform linux/arm64/v8,linux/amd64 --tag wener/java:8 8
	docker buildx build --push --platform linux/arm64/v8,linux/amd64 --tag wener/java:8-builder 8-builder
