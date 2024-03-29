# curdir is hostexecutor in gitea actions
# APP_NAME:=
# gitea actions use gitea as host
# IMAGE_REPO:=

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
# for reproducible build
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
	@! [ -e package.json ] || { \
	 echo "NodeJS:              $(shell node -v)"; \
	 echo "NPM:                 $(shell npm -v)"; \
	}

ci: info build
	docker buildx build --push -t $(IMAGE) .

.PHONY: build
build:
	[ -e node_modules ] || npm i
	npm run build
