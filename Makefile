REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

.PHONY: xvfb
xvfb:
	@printf Building $(COLOR_INFO) "app"
	docker buildx build --cache-from=wener/cache:xvfb_xvfb --cache-to=wener/cache:xvfb_xvfb --load -t wener/xvfb xvfb
	docker push wener/xvfb

.PHONY: chromium
chromium:
	@printf Building $(COLOR_INFO) "chromium"
	docker buildx build --cache-from=wener/cache:chromium_chromium --cache-to=wener/cache:chromium_chromium --load -t wener/chromium chromium
	docker push wener/chromium
	VER=`docker run --rm  wener/chromium /usr/bin/chromium-browser --version | grep -Eo '[0-9.]+'` \
	&& crane tag wener/chromium $$VER

apko:
	docker run --rm -it -v $(PWD):/host -w /host --name apko distroless.dev/apko

# apko
# apk add nerdctl buildctl buildkit
# /etc/apk/cache
dev:
	docker run --rm -it -v $(PWD):/host -w /host --name dockerfiles wener/base:v3.17

pub:
	apko publish base/base/build.yaml wener/base wener/base:v3.17 wener/base:v3.17.0

prepare:
	apk add make
