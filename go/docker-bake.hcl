variable "IMAGE_NAME" { default = "go" }
variable "VERSION" { default = "" }
variable "ALPINE_RELEASE" { default = "3.19.1" }
variable "ALPINE_VERSION" { default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}" }

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    ALPINE_RELEASE = ALPINE_RELEASE
    ALPINE_VERSION = ALPINE_VERSION
    VERSION        = VERSION
  }
}

group "default" {
  targets = ["go", "win"]
}

target "go" {
  inherits = ["base"]
  context  = "go"
  tags     = tags("latest")
}

target "win" {
  inherits  = ["base"]
  context   = "win"
  tags      = tags("win")
  platforms = ["linux/amd64"]
  contexts  = {
    "wener/go:${VERSION}" : "target:go",
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
