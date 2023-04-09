variable "IMAGE_NAME" {
  default = "ubuntu"
}
variable "VERSION" { default = "" }
variable "DEV" { default = "" }

group "default" {
  targets = ["jammy", "focal", "bionic", "ml"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = equal("", DEV) ? ["linux/amd64", "linux/arm64"] : ["linux/amd64"]
  pull       = true
}

target "jammy" {
  inherits = ["base"]
  context  = "ubuntu"
  tags     = tags("22.04")
  args     = {
    VERSION = "22.04"
  }
}

target "focal" {
  inherits = ["base"]
  context  = "ubuntu"
  tags     = tags("20.04")
  args     = {
    VERSION = "20.04"
  }
}

target "bionic" {
  inherits = ["base"]
  context  = "ubuntu"
  tags     = tags("18.04")
  args     = {
    VERSION = "18.04"
  }
}

target "ml" {
  inherits  = ["base"]
  context   = "ml"
  tags      = tags("ml")
  platforms = ["linux/amd64"]
  contexts  = {
    "wener/ubuntu" : "target:jammy"
  }
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${name}-${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${name}-${VERSION}" : "",
  ]
}
