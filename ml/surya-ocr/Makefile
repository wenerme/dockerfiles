# http://0.0.0.0:3050/openapi.json

-include local.mk

PORT?=3050
VERSION=$(shell grep 'surya-ocr==' requirements.txt | cut -d '=' -f 3)

info:
	@echo "Version: $(VERSION)"
	@echo "Port: $(PORT)"
	@echo "Images: "
	VERSION=$(VERSION) docker buildx bake --print | jq -r '.target.base.tags[]'
dev:
	poetry run uvicorn main:app --reload --host 0.0.0.0 --port $(PORT)

ifneq ("$(wildcard pyproject.toml)","")
install:
	poetry install
outdated:
	poetry show --outdated
fmt:
	poery run black .
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

push:
	VERSION=$(VERSION) docker buildx bake --push

docker-clean:
	-docker rmi quay.io/wener/surya-ocr
	docker images -f "dangling=true" -q | xargs --no-run-if-empty docker rmi
