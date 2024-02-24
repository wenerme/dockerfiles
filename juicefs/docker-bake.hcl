variable "TAG" { default = "latest" }
variable "VERSION" { default = "" }
variable "IMAGE_NAME" { default = "juicefs" }
variable "ALPINE_RELEASE" { default = "3.18.3" }

group "default" {
  targets = ["juicefs"]
}

target "juicefs" {
  inherits  = ["base"]
  context   = "juicefs"
  tags      = tags("latest")
}


target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    VERSION        = VERSION,
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
