variable "VERSION" { default = "1.4.4" }
variable "ALPINE_RELEASE" { default = "3.24.3" }
variable "REV" { default = "0" }

group "default" {
  targets = ["bun"]
}

target "bun" {
  context    = "bun"
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
  tags = ["docker.io/wener/bun:${VERSION}-alpine-${ALPINE_RELEASE}-r${REV}"]
}
