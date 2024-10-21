# still insrall torch
#FROM pytorch/pytorch:2.5.0-cuda12.4-cudnn9-runtime

FROM python:3.12
RUN \
    --mount=type=cache,target=/var/cache/apt/archives/ \
    --mount=type=cache,target=/var/lib/apt/lists/ \
    apt-get update && apt-get install -y     \
    libgl1-mesa-glx

RUN mkdir /app -p
WORKDIR /app

COPY requirements.txt /app
RUN --mount=type=cache,target=/root/.cache/pip \
  pip install -r requirements.txt


COPY preload.py /app

# /root/.cache/huggingface/hub
# RUN python preload.py

COPY main.py /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${PORT:-3000}"]
