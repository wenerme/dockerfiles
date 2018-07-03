FROM arangodb

# FIX https://github.com/wekan/wekan/issues/1303
RUN apt-get update -y && apt-get install -y --no-install-recommends paxctl && \
    paxctl -mc `which arangod` && \
    apt-get remove --purge -y paxctl && \
    apt-get autoremove -y && \
    rm -R /var/lib/apt/lists/*
