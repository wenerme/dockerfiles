REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

#ALPINE_RELEASE ?= $(shell curl -sf https://alpinelinux.org/releases.json | jq '.release_branches[1].releases[0].version' -r)
#export ALPINE_RELEASE
#
#print:
#	docker buildx bake --print
#
#push:
#	docker buildx bake --push
