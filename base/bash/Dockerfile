FROM wener/base
LABEL org.label-schema.name="base:bash" \
    org.label-schema.description="Alpine Linux base image with bash as default shell"

# Use bash as default shell
RUN apk --no-cache add bash && \
    mv /bin/sh /bin/ash && \
    ln -s /bin/bash /bin/sh

COPY root /

ENTRYPOINT ["bash"]
