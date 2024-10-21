FROM quay.io/wener/pytorch:2.5.0-py3.12

RUN mkdir /app -p
WORKDIR /app

COPY poetry.lock /app
COPY pyproject.toml /app
RUN --mount=type=cache,target=/root/.cache/poetry \
  poetry install --no-root --no-directory --only main

COPY preload.py /app
COPY main.py /app

#CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${PORT:-3000}"]
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
