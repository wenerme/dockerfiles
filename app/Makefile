REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

push:

tags:
	VERSION=3.18.0 $(MAKE) push
	VERSION=3.18 $(MAKE) push
