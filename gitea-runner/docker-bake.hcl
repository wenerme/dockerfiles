variable "IMAGE_NAME" { default = "gitea-runner" }
variable "VERSION" { default = "" }
variable "REV" { default = "0" }
variable "ALPINE_RELEASE" { default = "3.19.1" }
variable "ALPINE_VERSION" { default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}" }
variable "BUILDER_REV" { default = "0" }

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    ALPINE_RELEASE = ALPINE_RELEASE
    ALPINE_VERSION = ALPINE_VERSION
    BUILDER_REV    = BUILDER_REV
    VERSION        = VERSION
  }
  contexts = {
    "wener/builder:${ALPINE_RELEASE}-r${BUILDER_REV}" = "docker-image://quay.io/wener/builder:${ALPINE_RELEASE}-r${BUILDER_REV}"
  }
}

target "default" {
  inherits = ["base"]
  context  = "gitea-runner"
  tags     = tags("latest")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}",
    "quay.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}-r${REV}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}-r${REV}" : "",
    # include base version
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}-alpine-${ALPINE_RELEASE}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}-alpine-${ALPINE_RELEASE}" : "",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}-alpine-${ALPINE_RELEASE}-r${REV}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}-alpine-${ALPINE_RELEASE}-r${REV}" : "",
  ]
}
