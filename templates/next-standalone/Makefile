
build:
	pnpm next build
dev:
	pnpm next dev

ifneq (,$(wildcard docker-bake.hcl))
image-load: build
	docker buildx bake --load
image-push: build
	docker buildx bake --push
image-ls:
	docker buildx bake --print
endif

deploy:
	$(MAKE) image-push
