variable "IMAGE_NAME" { default = "dev" }
variable "VERSION" { default = "" }
variable "NODE_VERSION" { default = "22" }
variable "ALPINE_RELEASE" { default = "3.19.1" }

group "default" {
  targets = ["dev"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    NODE_VERSION = NODE_VERSION
    ALPINE_RELEASE = ALPINE_RELEASE
  }
}

target "dev" {
  inherits = ["base"]
  context  = "dev"
  tags     = tags("latest")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}",
    "quay.io/wener/${IMAGE_NAME}:${name}",

    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}