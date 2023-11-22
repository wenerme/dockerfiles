FROM wener/base

RUN --mount=type=cache,target=/etc/apk/cache  \
    apk add python3 py3-pip gcc python3-dev musl-dev linux-headers
RUN --mount=type=cache,target=/root/.cache \
    pip install continuedev

RUN mkdir -p /opt/app
WORKDIR /opt/app

# python -m continuedev --port 65432 --host 0.0.0.0
EXPOSE 65432
CMD [ "python", "-m", "continuedev", "--port", "65432", "--host", "0.0.0.0" ]
