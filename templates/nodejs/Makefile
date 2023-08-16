CI_COMMIT_BRANCH	?=$(shell git rev-parse --abbrev-ref HEAD)
CI_COMMIT_TAG		?=$(shell git describe --tags --exact-match 2>/dev/null)
CI_COMMIT_SHA		?=$(shell git rev-parse HEAD)
CI_COMMIT_SHORT_SHA	?=$(shell git rev-parse --short HEAD)

APP_NAME?=$(shell basename $(CURDIR))
IMAGE_TAG?=$(shell echo $(CI_COMMIT_BRANCH) | tr '/' '-')
IMAGE_NAME?=$(APP_NAME):$(IMAGE_TAG)
# git@example.com:org/repo.git -> example.com/org/repo
# https://example.com/org/repo.git
IMAGE_REPO?=$(shell git remote get-url origin | sed -r -e 's-^https?://--' -e 's/^git@//' -e 's/.git$$//' -e 's-:-/-g' -e "s/$(APP_NAME)$$//" -e 's-//-/-g' -e 's-/$$--' )
IMAGE?=$(IMAGE_REPO)/$(APP_NAME):$(IMAGE_TAG)

export CI_COMMIT_BRANCH
export CI_COMMIT_TAG
export CI_COMMIT_SHA
export CI_COMMIT_SHORT_SHA
export SOURCE_DATE_EPOCH=$(shell git log -1 --pretty=%ct)

info:
	@echo "APP_NAME:            $(APP_NAME)"
	@echo "CI_COMMIT_BRANCH:    $(CI_COMMIT_BRANCH)"
	@echo "CI_COMMIT_TAG:       $(CI_COMMIT_TAG)"
	@echo "CI_COMMIT_SHA:       $(CI_COMMIT_SHA)"
	@echo "CI_COMMIT_SHORT_SHA: $(CI_COMMIT_SHORT_SHA)"
	@echo "SOURCE_DATE_EPOCH:   $(SOURCE_DATE_EPOCH)"
	@echo "IMAGE_TAG:           $(IMAGE_TAG)"
	@echo "IMAGE_NAME:          $(IMAGE_NAME)"
	@echo "IMAGE_REPO:          $(IMAGE_REPO)"
	@echo "IMAGE:               $(IMAGE)"

# curdir is hostexecutor in gitea actions
ci: APP_NAME=server
# gitea actions use gitea as host
ci: IMAGE_REPO=github.com/wenerme
ci: info
	docker buildx build --push -t $(IMAGE) .

build:
	docker buildx build --load -t $(IMAGE_NAME) .
