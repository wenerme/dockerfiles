#!/bin/bash
set -e

# support arch
# https://github.com/docker-library/official-images#architectures-other-than-amd64

NAME=$1
TAG=$2
BASE=${NAME}:${TAG}

docker manifest create -a wener/${BASE} wener/${BASE} warm32v7/${BASE}
docker manifest annotate wener/${BASE} wener/${BASE} --os linux --arch amd64
docker manifest annotate wener/${BASE} warm32v7/${BASE} --os linux --arch arm --variant v7
docker manifest push wener/${BASE}
