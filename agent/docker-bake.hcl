variable "IMAGE_NAME" { default = "agent" }
variable "REV" { default = "0" }
variable "ALPINE_RELEASE" { default = "3.24.1" }
variable "ALPINE_VERSION" { default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}" }

group "default" {
  targets = ["agent"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args = {
    ALPINE_RELEASE = ALPINE_RELEASE
    ALPINE_VERSION = ALPINE_VERSION
    REV            = REV
  }
  contexts = {
    "wener/base:${ALPINE_RELEASE}" = "docker-image://quay.io/wener/base:${ALPINE_RELEASE}"
  }
}

target "agent" {
  inherits = ["base"]
  context  = "agent"
  tags     = tags("latest")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}",
    "quay.io/wener/${IMAGE_NAME}:${name}",

    "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${ALPINE_VERSION}",
    "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${ALPINE_VERSION}",

    "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${ALPINE_RELEASE}",
    "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${ALPINE_RELEASE}",

    "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${ALPINE_RELEASE}-r${REV}",
    "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${ALPINE_RELEASE}-r${REV}",
  ]
}
