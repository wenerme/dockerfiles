REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

VERSION ?= $(shell docker run --rm -it wener/base:$(ALPINE_RELEASE) sh -c 'apk update >/dev/null;apk policy nginx | sed "2!d"  | sed -r "s/^\s*([0-9.]+).*/\1/"')
export VERSION
export ALPINE_RELEASE
