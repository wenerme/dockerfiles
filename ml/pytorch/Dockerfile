ARG PYTHON_VERSION=3.12
FROM python:$PYTHON_VERSION

RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=cache,target=/root/.cache/pipx \
    pip install pipx \
    && pipx install poetry --global

RUN \
    --mount=type=cache,target=/var/cache/apt/archives/ \
    --mount=type=cache,target=/var/lib/apt/lists/ \
    apt-get update && apt-get install -y     \
    libgl1-mesa-glx

WORKDIR /app

ENV VENV_PATH=/app/.venv
ENV POETRY_VIRTUALENVS_PATH=/app/.venv
ENV POETRY_VIRTUALENVS_CREATE=false

# $POETRY_HOME/bin:
ENV PATH="$VENV_PATH/bin:$PATH"

ARG TORCH_VERSION=2.5.0
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m venv $VENV_PATH \
    && python -m pip install --upgrade pip \
    && pip install torch==$TORCH_VERSION
#    && pip install torch==$TORCH_VERSION+cpu torchvision==$TORCH_VERSION+cpu torchaudio==$TORCH_VERSION -f https://download.pytorch.org/whl/torch_stable.html
