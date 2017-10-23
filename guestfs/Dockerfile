FROM wener/ubuntu
MAINTAINER wener

RUN apt-get update && apt-get install --no-install-recommends -y \
        libguestfs-tools \
        qemu-utils \
    && rm -rf /var/lib/apt/lists/*

ENV LIBGUESTFS_BACKEND=direct \
    HOME=/root

CMD ["guestfish"]
