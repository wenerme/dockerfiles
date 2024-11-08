REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

#ALPINE_RELEASE ?= $(shell curl -sf https://alpinelinux.org/releases.json | jq '.release_branches[1].releases[0].version' -r)
export ALPINE_RELEASE

#print:
#	docker buildx bake --print
#
#push:
#	docker buildx bake --push


#build: base openrc app
#
#IMAGE=
#SH_VERSION ?=sh -c 'cat /etc/os-release | grep VERSION_ID | cut -d= -f2 | tr -d "[:space:]"'
#VERSION ?= $(shell docker run --rm $(IMAGE) $(SH_VERSION))
#
#
#.PHONY: app
#app:
#	@printf Building $(COLOR_INFO) "app"
#	docker buildx build --cache-from=wener/cache:base_app --cache-to=wener/cache:base_app --load -t wener/base:app app
#	docker push wener/base:app
#
#.PHONY: openrc
#openrc:
#	@printf Building $(COLOR_INFO) "openrc"
#	docker buildx build --cache-from=wener/cache:base_openrc --cache-to=wener/cache:base_openrc --load -t wener/base:openrc openrc
#	docker push wener/base:openrc
#
#
#.PHONY: base
#base:
#	cd base && $(MAKE) build
#
#ma:
#	docker buildx bake --push
