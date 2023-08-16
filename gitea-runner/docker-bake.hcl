variable "IMAGE_NAME" { default = "gitea-runner" }
variable "VERSION" { default = "" }
variable "ALPINE_VERSION" { default = "3.18" }
variable "DEV" { default = "" }


target "base" {
  dockerfile = "Dockerfile"
  #platforms  = equal("", DEV) ? ["linux/amd64", "linux/arm64"] : ["linux/amd64"]
  platforms  = ["linux/amd64"]
  pull       = true
}

target "default" {
  inherits = ["base"]
  context  = "gitea-runner"
  tags     = tags("latest")
  args     = {
    VERSION = VERSION
    ALPINE_VERSION = ALPINE_VERSION
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
