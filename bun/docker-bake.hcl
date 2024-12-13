variable "IMAGE_NAME" { default = "bun" }
variable "VERSION" { default = "" }
variable "ALPINE_RELEASE" { default = "" }


target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64","linux/arm64"]
  pull       = true
}

target "default" {
  inherits = ["base"]
  context  = "bun"
  tags     = tags("latest")
  args     = {
    BUN_VERSION = VERSION
    ALPINE_RELEASE = ALPINE_RELEASE
  }
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    // "quay.io/wener/${IMAGE_NAME}:${name}",
    // notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}
