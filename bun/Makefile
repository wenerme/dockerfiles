REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

export ALPINE_RELEASE
export VERSION=1.1.38
push:
	docker buildx bake --push

print:
	docker buildx bake --print

load:
	docker buildx bake --load
