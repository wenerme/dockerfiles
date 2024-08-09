variable "TAG" { default = "latest" }
variable "IMAGE_NAME" { default = "php" }
variable "VERSION" { default = "" }
variable "ALPINE_RELEASE" { default = "3.18.3" }
variable "ALPINE_VERSION" { default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}" }

group "default" {
  targets = [
    // "81", // 3.19 only
    "82",
    "83",
    // "84",
  ]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    ALPINE_RELEASE = ALPINE_RELEASE
    ALPINE_VERSION = ALPINE_VERSION
  }
}

target "7" {
  inherits   = ["base"]
  context    = "."
  dockerfile = "7/Dockerfile"
  tags       = tags("7")
}
target "81" {
  inherits   = ["base"]
  context    = "."
  dockerfile = "8.1/Dockerfile"
  tags       = tags("8.1")
}

target "82" {
  inherits   = ["base"]
  context    = "."
  dockerfile = "8.2/Dockerfile"
  tags       = tags("8.2")
}

target "83" {
  inherits   = ["base"]
  context    = "."
  dockerfile = "8.3/Dockerfile"
  tags       = tags("8.3")
}

target "84" {
  inherits   = ["base"]
  context    = "."
  dockerfile = "8.4/Dockerfile"
  tags       = tags("8.4")
}

target "8" {
  inherits   = ["base"]
  context    = "."
  dockerfile = "8/Dockerfile"
  tags       = tags("8")
}

target "7-composer" {
  inherits = ["base"]
  context  = "7-composer"
  tags     = tags("7-composer")
  contexts = {
    "wener/php:7" : "target:7",
  }
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
  ]
}
