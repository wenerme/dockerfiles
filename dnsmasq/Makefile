PKG ?= dnsmasq-dnssec
VERSION ?= $(shell docker run --rm -it wener/base sh -c 'apk update >/dev/null;apk policy $(PKG) | sed "2!d"  | sed -r "s/^\s*([0-9.]+).*/\1/"')
export VERSION

print:
	docker buildx bake --print

push:
	docker buildx bake --push
