variable "IMAGE_NAME" {
  default = "chromium"
}
variable "VERSION" { default = "" }
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
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}
