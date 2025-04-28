REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
#-include $(REPO_ROOT)/py.mk

-include local.mk

ifneq ("$(wildcard pyproject.toml)","")
install:
	poetry install
outdated:
	poetry show --outdated
fmt:
	poetry run black .
tidy\:sync:
	poetry lock
	poetry install --sync
tidy:
	poetry lock
	poetry install

run\:%:
	poetry run $(subst run:,,$@)

else ifneq ("$(wildcard requirements.txt)","")

install: ## install requirements
	pip install -r requirements.txt
freeze: ## freeze requirements
	pip freeze > requirements.txt
outdated: ## show outdated packages
	pip list --outdated
setup: ## setup venv
	python3 -m venv venv
	. venv/bin/activate && pip install -r requirements.txt

endif

help: ## show help message
	@grep -E -h '\s##\s' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
