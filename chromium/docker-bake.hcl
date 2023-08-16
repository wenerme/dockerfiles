variable "IMAGE_NAME" { default = "chromium" }
variable "VERSION" { default = "" }
variable "ALPINE_RELEASE" { default = "3.18.3" }
variable "DEV" { default = "" }


target "base" {
  dockerfile = "Dockerfile"
  platforms  = equal("", DEV) ? ["linux/amd64", "linux/arm64"] : ["linux/amd64"]
  pull       = true
}

target "default" {
  inherits = ["base"]
  context  = "."
  tags     = tags("latest")
  args     = {
    ALPINE_RELEASE = ALPINE_RELEASE
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
