variable "TAG" {
  default = "latest"
}
variable "VERSION" {default="" }

group "default" {
  targets = ["16","node","docker","tsx"]
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
  tags = concat(tags("latest"),tags("18"))
}

target "docker" {
  inherits = ["base"]
  context = "docker"
  contexts = {
    "wener/node" = "target:node"
  }
  tags = tags("docker")
}

target "tsx" {
  inherits = ["base"]
  context = "tsx"
  contexts = {
    "wener/node" = "target:node"
  }
  tags = tags("tsx")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/node:${name}","quay.io/wener/node:${name}",
#    notequal("",VERSION) ? "docker.io/wener/java:${VERSION}": "",
#    notequal("",VERSION) ? "quay.io/wener/java:${VERSION}": "",
  ]
}
