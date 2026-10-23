variable "VERSION" { default = "26.12.1" }
variable "ALPINE_RELEASE" { default = "3.24.3" }
variable "REV" { default = "0" }
variable "PNPM_VERSION" { default = "11.28.7" }
variable "YARN_VERSION" { default = "1.22.22" }

group "default" {
  targets = ["node"]
}

target "node" {
  context    = "node"
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args = {
    VERSION        = VERSION
    ALPINE_RELEASE = ALPINE_RELEASE
    PNPM_VERSION   = PNPM_VERSION
    YARN_VERSION   = YARN_VERSION
  }
  contexts = {
    "wener/base:${ALPINE_RELEASE}" = "docker-image://ghcr.io/wenerme/dockerfiles/base:${ALPINE_RELEASE}-r0"
  }
  tags = [
    "docker.io/wener/node:${VERSION}-alpine-${ALPINE_RELEASE}-r${REV}",
    "quay.io/wener/node:${VERSION}-alpine-${ALPINE_RELEASE}-r${REV}",
  ]
}
