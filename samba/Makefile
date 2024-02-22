ALPINE_RELEASE ?= $(shell curl -sf https://alpinelinux.org/releases.json | jq '.release_branches[1].releases[0].version' -r)
export ALPINE_RELEASE
ALPINE_VERSION ?= $(shell echo $(ALPINE_RELEASE) | cut -d. -f1,2)
export ALPINE_VERSION

inf:
	@echo ALPINE_RELEASE=$(ALPINE_RELEASE)
	@echo ALPINE_VERSION=$(ALPINE_VERSION)

push:
	VERSION=alpine-${ALPINE_VERSION} docker buildx bake --push
