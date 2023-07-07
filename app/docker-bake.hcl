variable "IMAGE_NAME" { default = "app" }
variable "TAG" { default = "latest" }
variable "VERSION" { default = "" }

group "default" {
  targets = ["app", "ssh"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
}

target "app" {
  inherits = ["base"]
  context  = "app"
  tags     = tags("latest")
}

target "ssh" {
  inherits = ["base"]
  context  = "ssh"
  tags     = tags("ssh")
  contexts = {
    "wener/app" : "target:app"
  }
}


function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}
