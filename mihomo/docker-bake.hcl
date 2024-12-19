variable "IMAGE_NAME" {
  default = "mihomo"
}
variable "VERSION" { default = "1.17.0" }
variable "ALPINE_RELEASE" { default = "" }
variable "ALPINE_VERSION" { default = "" }


group "default" {
  targets = ["mihomo", "compatible"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    VERSION = VERSION
    ALPINE_RELEASE = ALPINE_RELEASE
    ALPINE_VERSION = ALPINE_VERSION
  }
}

target "mihomo" {
  inherits = ["base"]
  context  = "mihomo"
  tags     = tags("mihomo")
}

target "compatible" {
  inherits  = ["base"]
  context   = "compatible"
  platforms = ["linux/amd64"]
  tags      = tags("compatible")
}

function "tags" {
  params = [name]
  result = notequal(IMAGE_NAME, name) ?[
    "docker.io/wener/${IMAGE_NAME}:${VERSION}-${name}", "quay.io/wener/${IMAGE_NAME}:${VERSION}-${name}",
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
  ] : [
    "docker.io/wener/${IMAGE_NAME}:${VERSION}", "quay.io/wener/${IMAGE_NAME}:${VERSION}",
    "docker.io/wener/${IMAGE_NAME}:latest", "quay.io/wener/${IMAGE_NAME}:latest",
  ]
}
