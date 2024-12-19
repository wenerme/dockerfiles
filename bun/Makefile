REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

# https://github.com/oven-sh/bun/releases
export VERSION=1.1.40
push:
	docker buildx bake --push

print:
	docker buildx bake --print

load:
	docker buildx bake --load
