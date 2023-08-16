REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

export VERSION=0.2.5
export ALPINE_VERSION=3.18

push:
	docker buildx bake --push

print:
	docker buildx bake --print
