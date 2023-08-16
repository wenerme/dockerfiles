IMAGE_REGISTRY		?= registry.gitlab.com/wenerme/wode

CI_COMMIT_BRANCH	?= $(shell git rev-parse --abbrev-ref HEAD)
CI_COMMIT_REF_NAME	?= $(shell git symbolic-ref -q --short HEAD || git describe --tags --exact-match)
CI_COMMIT_SHA		?= $(shell git rev-parse HEAD)
CI_COMMIT_SHORT_SHA	?= $(shell git rev-parse --short HEAD)
CI_COMMIT_TAG		?= $(shell git describe --tags --exact-match 2>/dev/null)
CI_COMMIT_TIMESTAMP	?= $(shell git log -1 --format=%ct)


DIR_NAME := $(shell basename $(CURDIR))
APP_NAME ?= $(DIR_NAME)

IMAGE_TAG 	?= $(CI_COMMIT_BRANCH)
IMAGE_NAME 	:= $(IMAGE_REGISTRY)/$(APP_NAME)

build:
	@echo "Building standalone apps..."
	CI_COMMIT_BRANCH=$(CI_COMMIT_BRANCH) \
	CI_COMMIT_REF_NAME=$(CI_COMMIT_REF_NAME) \
	CI_COMMIT_SHA=$(CI_COMMIT_SHA) \
	CI_COMMIT_SHORT_SHA=$(CI_COMMIT_SHORT_SHA) \
	CI_COMMIT_TAG=$(CI_COMMIT_TAG) \
	CI_COMMIT_TIMESTAMP=$(CI_COMMIT_TIMESTAMP) \
	STANDALONE=true pnpm next build

image:
	docker buildx build --load --build-arg APP_NAME=$(APP_NAME) --build-arg DIR_NAME=$(DIR_NAME) -t $(IMAGE_NAME) .
image-push:
	docker buildx build --push --build-arg APP_NAME=$(APP_NAME) --build-arg DIR_NAME=$(DIR_NAME) -t $(IMAGE_NAME):$(IMAGE_TAG) .
image-run:
	docker run --rm -it -p 3000:3000 --name $(APP_NAME) $(IMAGE_NAME)
