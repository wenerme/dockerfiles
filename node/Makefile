REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

PKG:=nodejs
export VERSION := $(shell docker run --rm -it wener/base:$(ALPINE_VERSION) sh -c 'apk update >/dev/null;apk policy $(PKG) | sed "2!d" | sed "s/[^0-9a-z.-]//g" | sed -r "s/-r[0-9]+$$//"')

push:

tag:
	#crane tag wener/node:18 `docker run --rm -it --pull=always wener/node:18 node -e "process.stdout.write(process.version.match(/^v(\d+\.\d+)/)[1])" 2>/dev/null`
	#crane tag quay.io/wener/node:18 `docker run --rm -it --pull=always wener/node:18 node -e "process.stdout.write(process.version.match(/^v(\d+\.\d+)/)[1])" 2>/dev/null`
	crane tag wener/node:20 `docker run --rm -it --pull=always wener/node:20 node -e "process.stdout.write(process.version.match(/^v(\d+\.\d+)/)[1])" 2>/dev/null`
	crane tag quay.io/wener/node:20 `docker run --rm -it --pull=always wener/node:20 node -e "process.stdout.write(process.version.match(/^v(\d+\.\d+)/)[1])" 2>/dev/null`
