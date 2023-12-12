REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

push:

tag:
	crane tag wener/node:18 `docker run --rm -it --pull=always wener/node:18 node -e "process.stdout.write(process.version.match(/^v(\d+\.\d+)/)[1])" 2>/dev/null`
	crane tag quay.io/wener/node:18 `docker run --rm -it --pull=always wener/node:18 node -e "process.stdout.write(process.version.match(/^v(\d+\.\d+)/)[1])" 2>/dev/null`
	crane tag wener/node:20 `docker run --rm -it --pull=always wener/node:20 node -e "process.stdout.write(process.version.match(/^v(\d+\.\d+)/)[1])" 2>/dev/null`
	crane tag quay.io/wener/node:20 `docker run --rm -it --pull=always wener/node:20 node -e "process.stdout.write(process.version.match(/^v(\d+\.\d+)/)[1])" 2>/dev/null`
