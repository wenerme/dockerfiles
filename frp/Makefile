PKG:=frp

#https://github.com/fatedier/frp/releases
#VERSION ?= $(shell docker run --rm -it wener/base sh -c 'apk update >/dev/null;apk policy $(PKG) | sed "2!d"  | sed -r "s/^\s*([0-9.]+).*/\1/"')
VERSION=0.56.0
export VERSION

info:
	docker buildx bake --print
push:
	docker buildx bake --push

build-%:
	docker buildx bake $*
push-%:
	docker buildx bake --push $*
