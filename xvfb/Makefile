ALPINE_RELEASE ?= $(shell curl -sf https://alpinelinux.org/releases.json | jq '.release_branches[1].releases[0].version' -r)
export ALPINE_RELEASE

push:
	docker buildx bake --push
