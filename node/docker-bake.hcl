variable "TAG" {
  default = "latest"
}
variable "VERSION" {default="" }

group "default" {
  targets = ["16","node","docker"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  pull = true
}

target "16" {
  inherits = ["base"]
  context = "16"
  tags = tags("16")

  // 非 offcial 无 aarch64
  // https://github.com/nodejs/node/pull/45756
  platforms = ["linux/amd64"]
}

target "node" {
  inherits = ["base"]
  context = "node"
  tags = tags("latest")
}

target "docker" {
  inherits = ["docker"]
  context = "docker"
  contexts = {
    "wener/node" = "node"
  }
  tags = tags("docker")
}


function "tags" {
  params = [name]
  result = [
    "docker.io/wener/node:${name}","quay.io/wener/node:${name}",
#    notequal("",VERSION) ? "docker.io/wener/java:${VERSION}": "",
#    notequal("",VERSION) ? "quay.io/wener/java:${VERSION}": "",
  ]
}
