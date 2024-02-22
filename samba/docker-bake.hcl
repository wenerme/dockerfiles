variable "TAG" { default = "latest" }
variable "IMAGE_NAME" { default = "samba" }
variable "VERSION" { default = "" }
variable "ALPINE_RELEASE" {
  default = "3.18.2"
}
variable "ALPINE_VERSION" {
  default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}"
}

group "default" {
  targets = ["samba"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    ALPINE_RELEASE = ALPINE_RELEASE
    ALPINE_VERSION = ALPINE_VERSION
  }
}

target "samba" {
  inherits = ["base"]
  context  = "samba"
  tags     = tags("latest")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}
