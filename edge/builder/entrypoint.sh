#!/bin/sh
set -e

chown -R builder /build
apk update
su-exec builder abuild-keygen -ain
su-exec builder abuild checksum
su-exec builder abuild "$@"
