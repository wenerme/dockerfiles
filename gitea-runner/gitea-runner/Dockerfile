ARG VERSION
ARG ALPINE_RELEASE

FROM gitea/act_runner:$VERSION as builder

FROM wener/builder:${ALPINE_RELEASE}

COPY --from=builder /usr/local/bin/act_runner /usr/local/bin/act_runner
COPY --from=builder /opt/act/run.sh /opt/act/run.sh

ENTRYPOINT ["/sbin/tini","--","/opt/act/run.sh"]
