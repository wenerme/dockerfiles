ALPINE_RELEASE ?= $(shell curl -sf https://alpinelinux.org/releases.json | jq '.release_branches[1].releases[0].version' -r)
export ALPINE_RELEASE

VERSION ?= $(shell docker run --rm -it --pull=always --entrypoint chromium wener/chromium --version 2>/dev/null | sed -r 's/Chromium\s*([0-9]+).*/\1/' | tr -d '[:space:]')
push:
	docker buildx bake --push

ver:
	@echo $(VERSION)

tag:
	crane tag wener/chromium $(VERSION)
	crane tag quay.io/wener/chromium $(VERSION)
