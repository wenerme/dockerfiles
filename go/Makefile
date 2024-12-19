REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

PKG:=go
export VERSION := $(shell docker run --rm -it wener/base:$(ALPINE_VERSION) sh -c 'apk update >/dev/null;apk policy $(PKG) | sed "2!d" | sed "s/[^0-9a-z.-]//g" | sed -r "s/-r[0-9]+$$//"')

push:
	docker buildx bake --push

print:
	docker buildx bake --print
