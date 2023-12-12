variable "TAG" {
  default = "latest"
}
variable "VERSION" { default = "" }

group "default" {
  targets = ["18", "node", "docker", "tsx"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
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
  tags     = concat(tags("latest"), tags("20"))
  args     = {
    ALPINE_VERSION = "3.19"
  }
}

target "docker" {
  inherits = ["base"]
  context  = "docker"
  contexts = {
    "wener/node" = "target:node"
  }
  tags = tags("docker")
}

target "tsx" {
  inherits = ["base"]
  context  = "tsx"
  contexts = {
    "wener/node" = "target:node"
  }
  tags = tags("tsx")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/node:${name}", "quay.io/wener/node:${name}",
  ]
}
