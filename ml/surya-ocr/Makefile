# http://0.0.0.0:3050/openapi.json

-include local.mk

PORT?=3050
dev:
	uvicorn main:app --reload --host 0.0.0.0 --port $(PORT)

freeze:
	pip freeze > requirements.txt

fmt:
	python3 -m black main.py

push:
	docker buildx bake --push

setup:
	python3 -m venv venv
	. venv/bin/activate && pip install -r requirements.txt
