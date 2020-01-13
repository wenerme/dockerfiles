FROM wener/base AS builder
ADD https://github.com/sethvargo/vault-secrets-gen/releases/download/v0.0.5/vault-secrets-gen__linux_amd64.tgz /
RUN tar -zxf vault-secrets-gen__linux_amd64.tgz

FROM vault
COPY --from=builder /vault-secrets-gen /etc/vault/plugins/
