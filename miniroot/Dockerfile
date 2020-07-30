FROM wener/base as builder

ARG version
ARG arch

RUN apk add --no-cache tar && mkdir /rootfs
COPY alpine-minirootfs-${version}-${arch}.tar.gz /
RUN tar zxf alpine-minirootfs-${version}-${arch}.tar.gz -C /rootfs
RUN cp /etc/apk/repositories /rootfs/etc/apk/repositories
# base
# RUN apk --root /rootfs --arch ${arch} add --no-cache curl busybox-extras file nano libc6-compat gcompat bash

FROM scratch
COPY --from=builder /rootfs /
SHELL [ "/bin/ash", "-c"]
CMD ["/bin/ash"]
