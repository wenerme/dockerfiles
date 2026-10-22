variable "VERSION" { default = "13.7" }
variable "REV" { default = "0" }
variable "DEBIAN_MIRROR" { default = "https://mirrors.tuna.tsinghua.edu.cn" }

group "default" {
  targets = ["debian"]
}

target "debian" {
  context    = "debian"
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args = {
    VERSION       = VERSION
    DEBIAN_MIRROR = DEBIAN_MIRROR
  }
  tags = [
    "docker.io/wener/debian:${VERSION}-r${REV}",
    "quay.io/wener/debian:${VERSION}-r${REV}",
  ]
}
