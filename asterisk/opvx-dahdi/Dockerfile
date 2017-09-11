FROM wener/base:bash
MAINTAINER wener

RUN apk add --no-cache \
    # Deps
    bison zlib{,-dev} ncurses{,-dev} libxml2{,-dev} openssl{,-dev} gnutls{,-dev} \
    # Build tools
    make abuild gcc g++ perl \
    # Kernel dev
    linux-headers \
    # or use linux-vanilla{,-dev} for kernel
    linux-hardened{,-dev}

WORKDIR /src
