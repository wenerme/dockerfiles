REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

VERSION:=$(ALPINE_RELEASE)
export ALPINE_RELEASE
export ALPINE_VERSION
export VERSION

push:
	docker buildx bake --push

print:
	docker buildx bake --print
