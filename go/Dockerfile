FROM        wener/base
LABEL org.label-schema.name="go" \
    org.label-schema.description="Golang based on Alpine Linux"

RUN apk add --no-cache go go-tools musl-dev git
RUN mkdir /root/go

ENTRYPOINT ["go"]
