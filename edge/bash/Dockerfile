FROM        wener/edge
MAINTAINER  wener<wener@wener.me>

# Use bash as default shell
RUN apk --no-cache add bash && \
    mv /bin/sh /bin/ash && \
    ln -s /bin/bash /bin/sh

COPY root /
ENTRYPOINT ["bash"]
