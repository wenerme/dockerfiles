variable "IMAGE_NAME" { default = "continue-server" }
variable "VERSION" { default = "" }


target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64"]
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
    "docker.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    "quay.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}
