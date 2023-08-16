REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/base.mk

clean: distclean ## clean up built files and caches
	rm -rf .next/* .turbo/* node_modules/.cache/*
distclean: ## clean up built files
	rm -rf dist/* lib/*

fmt:
	npx prettier -w src package.json

fix: LINT_FIX=1
fix: lint

LINT_FIX=
lint:
	@printf $(COLOR_INFO) "Linting..."
ifneq ($(wildcard next.config.*),)
	npx next lint $(if $(filter 1,$(LINT_FIX)),--fix)
else ifneq ($(wildcard .eslintrc.* $(REPO_ROOT)/.eslintrc.*),)
	npx eslint src $(if $(filter 1,$(LINT_FIX)),--fix)
else ifneq ($(wildcard tsconfig.json),)
	npx tsc --pretty --noEmit
else
	@printf $(COLOR_WARN) "No lint setup"
endif

chore: fmt fix ## run all chore tasks
