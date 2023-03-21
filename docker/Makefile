PKG:=docker

VERSION ?= $(shell docker run --rm -it wener/base sh -c 'apk update >/dev/null;apk policy $(PKG) | sed "2!d" | sed "s/[^0-9a-z.-]//g"')
export VERSION

info:
	docker buildx bake --print
push:
	docker buildx bake --push

build-%:
	docker buildx bake $*
push-%:
	docker buildx bake --push $*
