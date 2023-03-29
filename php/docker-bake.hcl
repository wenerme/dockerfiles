variable "TAG" {
  default = "latest"
}
variable "IMAGE_NAME" {
  default = "php"
}
variable "VERSION" {default="" }

group "default" {
  targets = ["7","7-composer"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  pull = true
}

target "7" {
  inherits = ["base"]
  context = "."
  dockerfile = "7/Dockerfile"
  tags = tags("7")
}
target "7-composer" {
  inherits = ["base"]
  context = "7-composer"
  tags = tags("7-composer")
  contexts = {
    "wener/php:7": "target:7",
  }
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}","quay.io/wener/${IMAGE_NAME}:${name}",
  ]
}
