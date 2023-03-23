REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
# -include $(REPO_ROOT)/build.mk

SHELL:=env bash -O extglob -O globstar

SOURCE_DATE_EPOCH?=$(shell git log -1 --pretty=%ct)

COLOR_INFO 	:= "\e[1;36m%s\e[0m\n"
COLOR_WARN 	:= "\e[1;31m%s\e[0m\n"


ifneq ($(wildcard docker-bake.hcl),)

info:
	docker buildx bake --print
push:
	docker buildx bake --push
push-%:
	docker buildx bake --push $(*)
endif
