variable "IMAGE_NAME" { default = "node" }
variable "VERSION" { default = "" }
variable "ALPINE_RELEASE" { default = "3.19.1" }
variable "ALPINE_VERSION" { default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}" }

variable "VERSION_MAJOR" { default = "${split(".", VERSION)[0]}" }
variable "VERSION_MAJOR_MINOR" { default = "${split(".", VERSION)[0]}.${split(".", VERSION)[1]}" }

group "default" {
  targets = ["node", "docker", "tsx"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    ALPINE_RELEASE = ALPINE_RELEASE
    ALPINE_VERSION = ALPINE_VERSION
    VERSION        = VERSION
  }
}

target "nvm" {
  inherits  = ["base"]
  context   = "nvm"
  platforms = ["linux/amd64"]
  tags      = ["docker.io/wener/${IMAGE_NAME}:nvm", "quay.io/wener/${IMAGE_NAME}:nvm"]
  args      = {
    ALPINE_RELEASE = ALPINE_RELEASE
  }
}

target "n" {
  inherits  = ["base"]
  context   = "n"
  # 无 arm64 https://unofficial-builds.nodejs.org/download/release/v20.11.1/
  platforms = ["linux/amd64"]
  tags      = ["docker.io/wener/${IMAGE_NAME}:${ver}-n", "quay.io/wener/${IMAGE_NAME}:${ver}-n"]
  matrix    = {
    ver = ["20.11.1"]
  }
  args = {
    ALPINE_RELEASE = ALPINE_RELEASE
    VERSION        = ver
  }
}

target "16" {
  inherits = ["base"]
  context  = "node"
  tags     = tags("16")
  args     = {
    ALPINE_VERSION = "3.16"
  }
}

target "18" {
  inherits = ["base"]
  context  = "node"
  tags     = tags("18")
  args     = {
    ALPINE_VERSION = "3.18"
  }
}

target "node" {
  inherits = ["base"]
  context  = "node"
  tags     = tags_full("latest")
}

target "docker" {
  inherits = ["base"]
  context  = "docker"
  tags     = tags("docker")
  contexts = {
    "wener/${IMAGE_NAME}:${VERSION}" = "target:node"
  }
}

target "tsx" {
  inherits = ["base"]
  context  = "tsx"
  tags     = tags("tsx")
  contexts = {
    "wener/${IMAGE_NAME}:${VERSION}" = "target:node"
  }
}

function "tags_full" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",

    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",

    notequal("", VERSION_MAJOR) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION_MAJOR}" : "",
    notequal("", VERSION_MAJOR) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION_MAJOR}" : "",

    notequal("", VERSION_MAJOR_MINOR) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION_MAJOR_MINOR}" : "",
    notequal("", VERSION_MAJOR_MINOR) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION_MAJOR_MINOR}" : "",
  ]
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",

    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}
