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

install:
	pip install -r requirements.txt
freeze:
	pip freeze > requirements.txt
outdated:
	pip list --outdated
setup:
	python3 -m venv venv
	. venv/bin/activate && pip install -r requirements.txt

endif
