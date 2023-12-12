variable "IMAGE_NAME" { default = "dnsmasq" }
variable "VERSION" { default = "" }


target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64","linux/arm64"]
  pull       = true
}

target "default" {
  inherits = ["base"]
  context  = IMAGE_NAME
  tags     = tags("latest")
  # args     = { VERSION = VERSION }
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    "quay.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}
