DOCKER_BUILD_BAKE ?= docker buildx bake

build:
	pnpm next build
dev:
	pnpm next dev

ifneq (,$(wildcard docker-bake.hcl))
image-build: build
	$(DOCKER_BUILD_BAKE)
image-load: build
	$(DOCKER_BUILD_BAKE) --load
image-push: build
	$(DOCKER_BUILD_BAKE) --push
image-ls:
	$(DOCKER_BUILD_BAKE) --print
endif

deploy:
	$(MAKE) image-push
