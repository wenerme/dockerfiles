ALPINE_RELEASE=3.19.0
push:
	docker buildx build --push --platform linux/arm64/v8,linux/amd64 --build-arg ALPINE_RELEASE=$(ALPINE_RELEASE) --tag wener/coding-net-worker:$(ALPINE_RELEASE) coding-net-worker
