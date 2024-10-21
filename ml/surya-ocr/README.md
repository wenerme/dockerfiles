# surya ocr

Simple surya OCR API wrapper

- quay.io/wener/surya-ocr:latest
  - about 6G - nvidia+torch
  - maybe should use base image like https://hub.docker.com/r/pytorch/pytorch/tags
    - but I don't know how to choose the right cuda version


**preload**

> Highly recommend to mount a cache dir to /root/.cache/ for HF models

```bash
# start with locale cache
# change /data/cache to your cache dir
docker run --rm -it \
  -p 3000:3000 \
  -v /data/cache:/root/.cache/ \
  --name surya-ocr quay.io/wener/surya-ocr:latest

# preload will download models
# about 2G
docker run --rm -it --entrypoint bash -v /data/cache:/root/.cache/ quay.io/wener/surya-ocr:latest
python preload.py
```

**dev/locale**

```bash
make setpup # venv and install
source venv/bin/activate

make dev    # start at port 3050

# request the API
curl -X POST -F "images=@test.png" http://localhost:3050/layout

# https://github.com/VikParuchuri/tabled
curl -X POST -F "images=@table.png" http://localhost:3050/tabled
```

- env
  - UPLOAD_DIR=/tmp/uploads
- https://github.com/VikParuchuri/surya
