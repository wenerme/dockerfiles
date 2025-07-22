REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

PKG:=dante

VERSION ?= $(shell docker run --rm -it wener/base sh -c 'apk update >/dev/null;apk policy $(PKG) | sed "2!d" | sed "s/[^0-9a-z.-]//g"')
export VERSION

info:

push:
