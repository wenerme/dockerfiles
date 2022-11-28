FROM wener/app


RUN --mount=type=cache,target=/etc/apk/cache \
    apk add xvfb xdpyinfo glib x11vnc fluxbox \
    && apk add -X https://mirrors.sjtug.sjtu.edu.cn/alpine/edge/testing wmctrl \
    # Applications
    && apk add xterm htop xmessage feh

EXPOSE 5900
EXPOSE 5901

COPY rootfs /

RUN rc-update add xvfb default  \
    && rc-update add fluxbox default  \
    && rc-update add x11vnc default

ENV DISPLAY=:0
