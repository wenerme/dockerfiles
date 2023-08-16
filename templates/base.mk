REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
# -include $(REPO_ROOT)/base.mk

# globstar match all files
# extglob can exclude file
SHELL:=env bash -O extglob -O globstar

COLOR_INFO 	:= "\e[1;36m%s\e[0m\n"
COLOR_WARN 	:= "\e[1;31m%s\e[0m\n"

CI_COMMIT_BRANCH	?=$(shell git rev-parse --abbrev-ref HEAD)
CI_COMMIT_TAG		?=$(shell git describe --tags --exact-match 2>/dev/null)
CI_COMMIT_SHA		?=$(shell git rev-parse HEAD)
CI_COMMIT_SHORT_SHA	?=$(shell git rev-parse --short HEAD)
CI_COMMIT_TIMESTAMP	?= $(shell git log -1 --format=%ct)

APP_NAME?=$(shell basename $(CURDIR))
IMAGE_TAG?=$(shell echo $(CI_COMMIT_BRANCH) | tr '/' '-')
IMAGE_COMMIT_TAG?=$(IMAGE_TAG)-$(CI_COMMIT_SHORT_SHA)
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

-include $(REPO_ROOT)/local.mk
-include package.mk

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
	 echo "Package name:        $(shell jq -r '.name' package.json)"; \
	 echo "Package version:     $(shell jq -r '.version' package.json)"; \
	}
	@! [ -e $(REPO_ROOT)/pnpm-lock.yaml ] || { \
	 echo "PNPM:                $(shell pnpm -v)"; \
	}

.PHONY: build dev test

package-scripts-set: ## install scripts in package.json
	yq '.scripts.build="make build" | .scripts.deploy="make deploy" | .scripts.test="make test"' -i package.json

build: ## build project
dev: ## start dev server

ifneq ($(wildcard next.config.*),)
build:
	$(EXEC) next build
dev:
	$(EXEC) next dev
else ifneq ($(wildcard vite.config.*),)
build:
	$(EXEC) vite build
dev:
	$(EXEC) vite dev
endif

help: ## 帮助
	@grep -E -h '\s##\s' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
