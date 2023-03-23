variable "TAG" {
  default = "latest"
}
variable "VERSION" {default="" }

group "default" {
  targets = ["app","ssh"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  pull = true
}

target "app" {
  inherits = ["base"]
  context = "app"
  tags = tags("latest")
}

target "ssh" {
  inherits = ["base"]
  context = "ssh"
  tags = tags("ssh")
  contexts = {
    "wener/app": "target:app"
  }
}


function "tags" {
  params = [name]
  result = [
    "docker.io/wener/app:${name}","quay.io/wener/app:${name}",
#    notequal("",VERSION) ? "docker.io/wener/java:${VERSION}": "",
#    notequal("",VERSION) ? "quay.io/wener/java:${VERSION}": "",
  ]
}
