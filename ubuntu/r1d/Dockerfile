FROM wener/ubuntu:precise-i386
# Used for Xiaomi R1D router
MAINTAINER wener<wenermail@gmail.com>

RUN apt-get -qq update && apt-get install -y \
    make gcc git make lzma sudo bzip2 libelf-dev zip unzip \
    && rm -rf /var/lib/apt/lists/*
