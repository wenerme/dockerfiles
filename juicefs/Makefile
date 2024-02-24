REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

VERSION ?= $(shell curl -s https://api.github.com/repos/juicedata/juicefs/releases/latest | grep 'tag_name' | cut -d '"' -f 4 | tr -d 'v')
export VERSION
export ALPINE_RELEASE

push:
