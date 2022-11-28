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
