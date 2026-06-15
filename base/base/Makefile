REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk
#
#CACHE_KEY=$(shell realpath --relative-to $(REPO_ROOT) . | tr / _)
#
#IMAGE=wener/base:latest
#SH_VERSION ?=sh -c 'cat /etc/os-release | grep VERSION_ID | cut -d= -f2 | tr -d "[:space:]"'
#VERSION ?= $(shell docker run --rm $(IMAGE) $(SH_VERSION))

ALPINE_RELEASE ?= $(shell curl -sf https://alpinelinux.org/releases.json | jq '.release_branches[1].releases[0].version' -r)
export ALPINE_RELEASE

info:
	$(DOCKER_BUILD_BAKE) --print
build: dl
	$(DOCKER_BUILD_BAKE)
push: dl
	echo Building $(ALPINE_RELEASE)
	$(DOCKER_BUILD_BAKE) --push

push-latest:
	TAG=latest ALPINE_RELEASE=$(ALPINE_RELEASE) $(DOCKER_BUILD_BAKE) --push

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

dl:
	@for arch in amd64 arm64 386; do \
		file="alpine-minirootfs-$(ALPINE_RELEASE)-$$arch.tar.gz"; \
		case "$$arch" in \
			amd64) alpine_arch=x86_64 ;; \
			arm64) alpine_arch=aarch64 ;; \
			386) alpine_arch=x86 ;; \
		esac; \
		url="https://mirrors.aliyun.com/alpine/v$${ALPINE_RELEASE%.*}/releases/$$alpine_arch/alpine-minirootfs-$(ALPINE_RELEASE)-$$alpine_arch.tar.gz"; \
		if [ -f "$$file" ]; then \
			echo "Already exists: $$file"; \
		else \
			echo "Downloading $$url -> $$file"; \
			curl -fSL -C- -o "$$file" "$$url"; \
		fi; \
	done
