FROM        wener/go as grpc-go
RUN go get -u -v github.com/golang/protobuf/protoc-gen-go    && \
    go get -u -v google.golang.org/grpc                      && \
    go get -u -v github.com/square/goprotowrap/cmd/protowrap

FROM        wener/base:util
LABEL org.label-schema.name="grpc" \
    org.label-schema.description="gRpc tools based on Alpine Linux"

RUN wget -q -O /etc/apk/keys/wenerme.rsa.pub https://raw.githubusercontent.com/wenerme/statics/master/abuild/wenerme.rsa.pub && \
    echo '@wener https://raw.githubusercontent.com/wenerme/statics/master/abuild/packages/wener' >> /etc/apk/repositories
RUN apk update && apk add grpc@wener grpc-cli@wener grpc-java@wener

COPY --from=grpc-go /root/go/bin /usr/bin
