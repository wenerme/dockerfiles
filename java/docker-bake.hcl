variable "TAG" {
  default = "latest"
}
variable "VERSION" {default="" }

group "default" {
  targets = ["8","8-builder","8-ui","17"]
}

target "8" {
  context = "8"
  tags = tags("8")

  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  pull = true
}

target "8-builder" {
  inherits = ["8"]
  context = "8-builder"
  contexts = {
    "wener/java:8" = "target:8"
  }
  tags = tags("8-builder")
}

target "8-ui" {
  inherits = ["8"]
  context = "8-ui"
  contexts = {
    "wener/java:8" = "target:8"
  }
  tags = tags("8-ui")
}

target "17" {
  inherits = ["8"]
  context = "17"
  tags = tags("17")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/java:${name}","quay.io/wener/java:${name}",
#    notequal("",VERSION) ? "docker.io/wener/java:${VERSION}": "",
#    notequal("",VERSION) ? "quay.io/wener/java:${VERSION}": "",
  ]
}
