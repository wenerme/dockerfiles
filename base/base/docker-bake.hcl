variable "TAG" {
  default = "latest"
}

variable "ALPINE_RELEASE" {
  default = "3.18.0"
}
variable "ALPINE_VERSION" {
  default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}"
}
variable "ALPINE_MIRROR" {
  default = "https://mirrors.tuna.tsinghua.edu.cn/alpine"
  #  default = "https://mirrors.sjtug.sjtu.edu.cn/alpine"
}

group "default" {
  targets = ["base"]
}

target "base" {
  dockerfile = "Dockerfile"
  tags       = [
    "docker.io/wener/base:${ALPINE_RELEASE}", "quay.io/wener/base:${ALPINE_RELEASE}",
    "docker.io/wener/base:${ALPINE_VERSION}", "quay.io/wener/base:${ALPINE_VERSION}",
    "docker.io/wener/base:${TAG}", "quay.io/wener/base:${TAG}",
  ]
  platforms = [
    "linux/amd64", "linux/arm64",
    "linux/386", // "linux/arm/v7", "linux/arm/v6",
    // "linux/ppc64le",
    // "linux/s390x",
  ]
  args = {
    ALPINE_RELEASE = ALPINE_RELEASE
    ALPINE_VERSION = ALPINE_VERSION
    ALPINE_MIRROR  = ALPINE_MIRROR
  }
  pull = true
  # no-cache = true
}
