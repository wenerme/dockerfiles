REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

PKG:=frp

#https://github.com/fatedier/frp/releases
#VERSION ?= $(shell docker run --rm -it wener/base sh -c 'apk update >/dev/null;apk policy $(PKG) | sed "2!d"  | sed -r "s/^\s*([0-9.]+).*/\1/"')
VERSION=0.61.2
export VERSION

info:

push:
