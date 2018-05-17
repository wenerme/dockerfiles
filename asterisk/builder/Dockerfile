FROM wener/base:bash

RUN apk add --no-cache \
    # Deps
    bison zlib{,-dev} ncurses{,-dev} libxml2{,-dev} openssl{,-dev} gnutls{,-dev} \
    # Build tools
    make abuild gcc g++ perl \
    # Kernel dev
    linux-headers \
    linux-headers \
    linux-hardened{,-dev} linux-vanilla{,-dev}

WORKDIR /src
