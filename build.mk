REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
# -include $(REPO_ROOT)/build.mk

SHELL:=env bash -O extglob -O globstar

SOURCE_DATE_EPOCH?=$(shell git log -1 --pretty=%ct)

COLOR_INFO 	:= "\e[1;36m%s\e[0m\n"
COLOR_WARN 	:= "\e[1;31m%s\e[0m\n"

IMAGE_NAME?:=$(shell basename $(CURDIR))

#
ALPINE_RELEASE ?= $(shell curl -sf https://alpinelinux.org/releases.json | jq '.release_branches[1].releases[0].version' -r)


ifneq ($(wildcard docker-bake.hcl),)

DOCKER_BUILD_BAKE?=docker buildx bake

info:
	@realpath $(CURDIR) --relative-to $(REPO_ROOT)
	@echo "IMAGE_NAME:      $(IMAGE_NAME)"
	@echo "ALPINE_RELEASE:  $(ALPINE_RELEASE)"
	@echo "VERSION:         $(VERSION)"
# docker buildx bake --print
push:
	$(DOCKER_BUILD_BAKE) --push
push\:%:
	$(DOCKER_BUILD_BAKE) --push $(*)
print:
	$(DOCKER_BUILD_BAKE) --print
load:
	$(DOCKER_BUILD_BAKE) --load
load\:%:
	$(DOCKER_BUILD_BAKE) --load $(*)

.PHONY: build
build:
	$(DOCKER_BUILD_BAKE)

endif

# IMAGE_REPO/IMAGE_NAME:IMAGE_TAG
# IMAGE_REPO -> docker.io/wenerme, quay.io/wenerme
