#variable "TAG" {
#  default = "latest"
#}

variable "RELEASE_VERSION" {
  default = "3.17.2"
}

variable "MINOR_VERSION" {
  default = "${split(".", RELEASE_VERSION)[0]}.${split(".", RELEASE_VERSION)[1]}"
}

variable "MAJOR_VERSION" {
  default = "${split(".", RELEASE_VERSION)[0]}"
}

group "default" {
  targets = ["openrc","app"]
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/base:${RELEASE_VERSION}-${name}","quay.io/wener/base:${RELEASE_VERSION}-${name}",
    "docker.io/wener/base:${MINOR_VERSION}-${name}","quay.io/wener/base:${MINOR_VERSION}-${name}",
    "docker.io/wener/base:${MAJOR_VERSION}-${name}","quay.io/wener/base:${MAJOR_VERSION}-${name}",
    "docker.io/wener/base:${name}","quay.io/wener/base:${name}",
  ]
}

target "openrc" {
  context = "openrc"
  tags = tags("openrc")

  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  args = {
    RELEASE_VERSION = RELEASE_VERSION
  }
  pull = true
}

target "app" {
  inherits = ["openrc"]
  context = "app"
  tags = tags("app")
}
