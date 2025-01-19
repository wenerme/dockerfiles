variable "TAG" { default = "latest" }
variable "VERSION" { default = "" }
variable "IMAGE_NAME" { default = "sing-box" }
variable "ALPINE_RELEASE" { default = "3.18.3" }

group "default" {
  targets = ["sing-box"]
}

target "sing-box" {
  context = "sing-box"
  tags    = tags("latest")

  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    ALPINE_RELEASE = ALPINE_RELEASE
  }
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
    # "docker.io/wener/${IMAGE_NAME}:alpine-${ALPINE_RELEASE}", "quay.io/wener/${IMAGE_NAME}:alpine-${ALPINE_RELEASE}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}
