REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

GO_PACKAGE_VERSION_INPUT := $(GO_PACKAGE_VERSION)
override GO_PACKAGE_VERSION := $(or $(strip $(GO_PACKAGE_VERSION_INPUT)),1.26.3-r0)
ifneq ($(shell printf '%s\n' '$(GO_PACKAGE_VERSION)' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+-r[0-9]+$$'),$(GO_PACKAGE_VERSION))
$(error GO_PACKAGE_VERSION must be a non-empty major.minor.patch-rN APK version)
endif

export GO_PACKAGE_VERSION
export ALPINE_RELEASE ?= 3.24.1
export REV ?= 0
