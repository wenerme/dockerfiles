variable "IMAGE_NAME" { default = "pdns" }
variable "VERSION" { default = "5.0.7" }
variable "ALPINE_RELEASE" { default = "3.24.1" }
variable "ALPINE_VERSION" { default = "3.24" }
variable "REV" { default = "0" }

group "default" {
  targets = ["pdns"]
}

target "pdns" {
  context    = "pdns"
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args = {
    ALPINE_RELEASE = ALPINE_RELEASE
    VERSION        = VERSION
  }
  contexts = {
    "wener/base:${ALPINE_RELEASE}" = "docker-image://quay.io/wener/base:${ALPINE_RELEASE}"
  }
  tags = tags("latest", VERSION, ALPINE_RELEASE, ALPINE_VERSION)
}

function "tags" {
  params = [name, version, alpine_release, alpine_version]
  result = distinct(compact([
    "docker.io/wener/${IMAGE_NAME}:${name}",
    "quay.io/wener/${IMAGE_NAME}:${name}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${name}",
    "docker.io/wener/${IMAGE_NAME}:${version}",
    "quay.io/wener/${IMAGE_NAME}:${version}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${version}",
    "docker.io/wener/${IMAGE_NAME}:${version}-r${REV}",
    "quay.io/wener/${IMAGE_NAME}:${version}-r${REV}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${version}-r${REV}",
    "docker.io/wener/${IMAGE_NAME}:${version}-alpine-${alpine_version}-r${REV}",
    "quay.io/wener/${IMAGE_NAME}:${version}-alpine-${alpine_version}-r${REV}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${version}-alpine-${alpine_version}-r${REV}",
    "docker.io/wener/${IMAGE_NAME}:alpine-${alpine_release}",
    "quay.io/wener/${IMAGE_NAME}:alpine-${alpine_release}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:alpine-${alpine_release}",
    notequal("latest", name) ? "docker.io/wener/${IMAGE_NAME}:${name}-alpine-${alpine_version}-r${REV}" : "",
    notequal("latest", name) ? "quay.io/wener/${IMAGE_NAME}:${name}-alpine-${alpine_version}-r${REV}" : "",
    notequal("latest", name) ? "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${name}-alpine-${alpine_version}-r${REV}" : "",
  ]))
}
