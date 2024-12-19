REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

# https://hub.docker.com/r/gitea/act_runner/tags
# https://gitea.com/gitea/act_runner
export VERSION=0.2.11

push:
	docker buildx bake --push

print:
	docker buildx bake --print
