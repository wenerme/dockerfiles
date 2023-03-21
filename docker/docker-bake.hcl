variable "TAG" {
  default = "latest"
}
variable "VERSION" {default="" }

group "default" {
  targets = ["docker"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  pull = true
}

target "docker" {
  inherits = ["base"]
  context = "docker"
  tags = tags("latest")
}


function "tags" {
  params = [name]
  result = [
    "docker.io/wener/docker:${name}","quay.io/wener/docker:${name}",
#    notequal("",VERSION) ? "docker.io/wener/java:${VERSION}": "",
#    notequal("",VERSION) ? "quay.io/wener/java:${VERSION}": "",
  ]
}
