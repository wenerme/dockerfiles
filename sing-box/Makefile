REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

VERSION ?= $(shell docker run --rm -it wener/base:$(ALPINE_RELEASE) sh -c 'apk update -X https://mirrors.aliyun.com/alpine/edge/testing >/dev/null;apk policy -X https://mirrors.aliyun.com/alpine/edge/testing sing-box | sed "2!d"  | sed -r "s/^\s*([0-9.]+).*/\1/"')
export VERSION


info:

push:
