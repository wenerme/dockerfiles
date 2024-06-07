variable "IMAGE_NAME" { default = "caddy" }
variable "VERSION" { default = "2.8.4" }
variable "ALPINE_RELEASE" { default = "3.20.0" }
variable "DEV" { default = "" }


target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
}

group "default" {
  targets = ["docker-proxy"]
}

target "docker-proxy" {
  inherits = ["base"]
  context  = "docker-proxy"
  tags     = tags("docker-proxy")
  args     = {
    VERSION = VERSION
  }
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}
