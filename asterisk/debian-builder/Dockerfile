FROM wener/debian:builder

# lib{xml2,sqlite3,jansson,asound2,newt,pq,pri,resample,spandsp,speex,speexdsp,srtp}-dev
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        uuid-dev dahdi-source \
        libxml2-dev libsqlite3-dev libjansson-dev libasound2-dev libnewt-dev libpq-dev libpri-dev \
        libresample-dev libspandsp-dev libspeex-dev libspeexdsp-dev libsrtp-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /src
