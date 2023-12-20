variable "IMAGE_NAME" {
  default = "mihomo"
}
variable "VERSION" { default = "1.17.0" }

group "default" {
  targets = ["mihomo", "compatible"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
}

target "mihomo" {
  inherits = ["base"]
  context  = "mihomo"
  tags     = tags("mihomo")
  args     = {
    VERSION = "1.17.0"
  }
}

target "compatible" {
  inherits  = ["base"]
  context   = "compatible"
  platforms = ["linux/amd64"]
  tags      = tags("compatible")
  args      = {
    VERSION = VERSION
  }
}

function "tags" {
  params = [name]
  result = notequal(IMAGE_NAME, name) ?[
    "docker.io/wener/${IMAGE_NAME}:${VERSION}-${name}", "quay.io/wener/${IMAGE_NAME}:${VERSION}-${name}",
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
  ] : [
    "docker.io/wener/${IMAGE_NAME}:${VERSION}", "quay.io/wener/${IMAGE_NAME}:${VERSION}",
    "docker.io/wener/${IMAGE_NAME}:latest", "quay.io/wener/${IMAGE_NAME}:latest",
  ]
}
