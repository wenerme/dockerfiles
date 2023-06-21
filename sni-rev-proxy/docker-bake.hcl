variable "TAG" {
  default = "latest"
}
variable "IMAGE_NAME" {
  default = "sni-rev-proxy"
}
variable "VERSION" { default = "" }

group "default" {
  targets = ["default"]
}

target "base" {
  dockerfile = "Dockerfile"
#   platforms  = ["linux/amd64", "linux/arm64"]
  platforms  = ["linux/amd64"]
  pull       = true
}

target "default" {
  inherits   = ["base"]
  context    = "."
  dockerfile = "Dockerfile"
  tags       = tags("latest")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
  ]
}
