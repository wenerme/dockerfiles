variable "VERSION" { default = "0.71.1" }
variable "ALPINE_RELEASE" { default = "3.24.3" }
variable "REV" { default = "0" }

group "default" {
  targets = ["frp", "frpc", "frps"]
}

target "_common" {
  context    = "frp"
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args = {
    VERSION        = VERSION
    ALPINE_RELEASE = ALPINE_RELEASE
  }
  contexts = {
    "wener/base:${ALPINE_RELEASE}" = "docker-image://ghcr.io/wenerme/dockerfiles/base:${ALPINE_RELEASE}-r0"
  }
}

target "frp" {
  inherits = ["_common"]
  target   = "frp"
  tags     = ["docker.io/wener/frp:${VERSION}-alpine-${ALPINE_RELEASE}-r${REV}"]
}

target "frpc" {
  inherits = ["_common"]
  target   = "frpc"
  tags     = ["docker.io/wener/frpc:${VERSION}-alpine-${ALPINE_RELEASE}-r${REV}"]
}

target "frps" {
  inherits = ["_common"]
  target   = "frps"
  tags     = ["docker.io/wener/frps:${VERSION}-alpine-${ALPINE_RELEASE}-r${REV}"]
}
