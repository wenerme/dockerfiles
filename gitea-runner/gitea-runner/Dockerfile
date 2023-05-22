FROM gitea/act_runner:nightly as builder

FROM quay.io/wener/builder:3.18

COPY --from=builder /usr/local/bin/act_runner /usr/local/bin/act_runner
COPY --from=builder /opt/act/run.sh /opt/act/run.sh

ENTRYPOINT ["/sbin/tini","--","/opt/act/run.sh"]
