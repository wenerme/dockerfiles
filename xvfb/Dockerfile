FROM wener/base

ENV DISPLAY=:1

RUN apk add --no-cache xvfb xdpyinfo fluxbox glib x11vnc \
    && apk add -X https://mirrors.sjtug.sjtu.edu.cn/alpine/edge/testing wmctrl

EXPOSE 5900
EXPOSE 5901
