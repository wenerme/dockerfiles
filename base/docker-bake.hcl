#variable "TAG" {
#  default = "latest"
#}

variable "ALPINE_RELEASE" {
  default = "3.17.2"
}

variable "ALPINE_VERSION" {
  default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}"
}

variable "MAJOR_VERSION" {
  default = "${split(".", ALPINE_RELEASE)[0]}"
}

group "default" {
  targets = ["openrc","app"]
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/base:${ALPINE_RELEASE}-${name}","quay.io/wener/base:${ALPINE_RELEASE}-${name}",
    "docker.io/wener/base:${ALPINE_VERSION}-${name}","quay.io/wener/base:${ALPINE_VERSION}-${name}",
    "docker.io/wener/base:${MAJOR_VERSION}-${name}","quay.io/wener/base:${MAJOR_VERSION}-${name}",
    "docker.io/wener/base:${name}","quay.io/wener/base:${name}",
  ]
}

target base {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  args = {
    ALPINE_RELEASE = ALPINE_RELEASE
  }
  pull = true
}

target "openrc" {
  inherits = ["base"]
  context = "openrc"
  tags = tags("openrc")
}

target "app" {
  inherits = ["openrc"]
  context = "app"
  tags = tags("app")
  contexts = {
    "wener/base:${ALPINE_RELEASE}-openrc":"target:openrc"
  }
}
