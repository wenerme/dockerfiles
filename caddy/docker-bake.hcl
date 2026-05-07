variable "IMAGE_NAME" { default = "caddy" }
variable "VERSION" { default = "2.8.4" }
variable "REV" { default = "0" }
variable "ALPINE_RELEASE" { default = "3.20.0" }
variable "DEV" { default = "" }


target "base" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  pull       = true
  args = {
    VERSION        = VERSION
    ALPINE_RELEASE = ALPINE_RELEASE
  }
}

group "default" {
  targets = ["caddy", "full", "docker-proxy"]
}

target "caddy" {
  inherits = ["base"]
  context = "caddy"
  tags = tags("latest")
}

target "full" {
  inherits = ["base"]
  context = "full"
  tags = tags("full")
}

target "docker-proxy" {
  inherits = ["base"]
  context = "docker-proxy"
  tags = tags("docker-proxy")
  args = {
    VERSION        = VERSION
    ALPINE_RELEASE = ALPINE_RELEASE
  }
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
      notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}-r${REV}" : "",
      notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}-r${REV}" : "",
  ]
}
