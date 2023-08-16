REPO_ROOT 	?= $(shell git rev-parse --show-toplevel)
#-include $(REPO_ROOT)/java.mk # copy to dir & uncomment

SHEL := /bin/bash
-include $(wildcard .env.* $(REPO_ROOT)/.env.* .env $(REPO_ROOT)/.env)

MVN := $(REPO_ROOT)/mvnw

ifneq ("$(wildcard $(REPO_ROOT)/settings.xml)","")
MVN := $(MVN) -s $(REPO_ROOT)/settings.xml
endif

GIT_COMMIT_SHORT:=$(shell git rev-parse --short HEAD)
DOCKER_IMAGE_TAG:=$(or $(DOCKER_IMAGE_TAG), latest)

IMAGE_NAME ?= $(shell basename $(shell pwd))

fmt:

package:
	$(MVN) package

clean:
	$(MVN) clean

image:
ifneq ("$$(wildcard Dockerfile)","")
	docker buildx build -t $(IMAGE_NAME):$(GIT_COMMIT_SHORT) .
else
	$(MVN) jib:dockerBuild -Djib.console=plain
endif
