variable "IMAGE_NAME" {
  default = "xvfb"
}
variable "ALPINE_RELEASE" {
  default = "3.18.2"
}
variable "ALPINE_VERSION" {
  default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}"
}
variable "DEV" { default = "" }



target "base" {
  dockerfile = "Dockerfile"
  platforms  = equal("", DEV) ? ["linux/amd64", "linux/arm64"] : ["linux/amd64"]
  pull       = true
}

target "default" {
  inherits = ["base"]
  context  = "."
  tags     = tags(IMAGE_NAME)
  args     = {
    ALPINE_RELEASE = ALPINE_RELEASE
    ALPINE_VERSION = ALPINE_VERSION
  }
}

function "tags" {
  params = [name]
  result = notequal(IMAGE_NAME, name) ?[
    "docker.io/wener/${IMAGE_NAME}:${ALPINE_RELEASE}-${name}", "quay.io/wener/${IMAGE_NAME}:${ALPINE_RELEASE}-${name}",
    "docker.io/wener/${IMAGE_NAME}:${ALPINE_VERSION}-${name}", "quay.io/wener/${IMAGE_NAME}:${ALPINE_VERSION}-${name}",
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
  ] : [
    "docker.io/wener/${IMAGE_NAME}:${ALPINE_RELEASE}", "quay.io/wener/${IMAGE_NAME}:${ALPINE_RELEASE}",
    "docker.io/wener/${IMAGE_NAME}:${ALPINE_VERSION}", "quay.io/wener/${IMAGE_NAME}:${ALPINE_VERSION}",
    "docker.io/wener/${IMAGE_NAME}", "quay.io/wener/${IMAGE_NAME}",
  ]
}
