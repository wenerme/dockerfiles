#REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
#-include $(REPO_ROOT)/build.mk
#
#CACHE_KEY=$(shell realpath --relative-to $(REPO_ROOT) . | tr / _)
#
#IMAGE=wener/base:latest
#SH_VERSION ?=sh -c 'cat /etc/os-release | grep VERSION_ID | cut -d= -f2 | tr -d "[:space:]"'
#VERSION ?= $(shell docker run --rm $(IMAGE) $(SH_VERSION))

RELEASE_VERSION ?= $(shell curl -sf https://alpinelinux.org/releases.json | jq '.release_branches[1].releases[0].version' -r)
export RELEASE_VERSION

info:
	docker buildx bake --print
build:
	docker buildx bake
push:
	echo Building $(RELEASE_VERSION)
	docker buildx bake --push

#build: image tag
#image:
#	docker buildx build --cache-from=wener/cache:$(CACHE_KEY) --cache-to=wener/cache:$(CACHE_KEY) --load -t wener/base:latest .
#tag:
#	docker push $(IMAGE);
#	@VERSION=$(VERSION); echo -n $${VERSION},$${VERSION%.*},$${VERSION%.*.*} | xargs -rd ',' -I {} crane tag $(IMAGE) {}
#
#info:
#	@echo $(IMAGE) $(VERSION)
#	@VERSION=$(VERSION); echo tags: $${VERSION%.*} $${VERSION%.*.*}
