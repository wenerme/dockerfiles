REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
# -include $(REPO_ROOT)/build.mk

SHELL:=env bash -O extglob -O globstar

SOURCE_DATE_EPOCH?=$(shell git log -1 --pretty=%ct)

COLOR_INFO 	:= "\e[1;36m%s\e[0m\n"
COLOR_WARN 	:= "\e[1;31m%s\e[0m\n"

IMAGE_NAME	?=$(shell basename $(CURDIR))
IMAGE_NAME	:=$(or $(IMAGE_NAME),$(shell realpath $(CURDIR) --relative-to $(REPO_ROOT)))

-include $(REPO_ROOT)/.env

# Export DOCKER_CONFIG if .docker directory exists in repo root
ifneq ($(wildcard $(REPO_ROOT)/.docker),)
export DOCKER_CONFIG = $(REPO_ROOT)/.docker
endif

# 3.20.0
ALPINE_RELEASE ?= $(or $(ALPINE_RELEASE),$(shell curl -sf https://alpinelinux.org/releases.json | jq '.release_branches[1].releases[0].version' -r))
# 3.20
ALPINE_VERSION ?= $(or $(ALPINE_VERSION),$(shell echo $(ALPINE_RELEASE) | cut -d. -f1,2))

export ALPINE_RELEASE
export ALPINE_VERSION

# if tty set progress=plain by env
DOCKER_BUILD_PROGRESS?=auto


ifneq ($(wildcard docker-bake.hcl),)

DOCKER_BUILD_BAKE?=docker buildx bake

info:
	@realpath $(CURDIR) --relative-to $(REPO_ROOT)
	@echo "IMAGE_NAME:      $(IMAGE_NAME)"
	@echo "ALPINE_RELEASE:  $(ALPINE_RELEASE)"
	@echo "ALPINE_VERSION:  $(ALPINE_VERSION)"
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
