REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/build.mk

.PHONY: app

app:
	@printf Building $(COLOR_INFO) "app"
	docker buildx build --cache-from=wener/cache:app_app --cache-to=wener/cache:app_app --load -t wener/app app
	docker push wener/app
