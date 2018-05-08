FROM wener/base:bash
WORKDIR /
RUN wget https://raw.githubusercontent.com/qemu/qemu/master/scripts/qemu-binfmt-conf.sh && \
    chmod +x qemu-binfmt-conf.sh

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
