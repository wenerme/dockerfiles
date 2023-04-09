# syntax=docker/dockerfile:1

FROM wener/ubuntu

ENV PIP_ROOT_USER_ACTION=ignore

COPY rootfs/ /
RUN sh /setup-image.sh

