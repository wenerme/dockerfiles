variable "TAG" { default = "latest" }
variable "VERSION" { default = "" }
variable "IMAGE_NAME" { default = "nginx" }
variable "ALPINE_RELEASE" { default = "3.18.3" }

group "default" {
  targets = ["nginx"]
}

target "nginx" {
  context = "nginx"
  tags    = tags("latest")

  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    ALPINE_RELEASE = ALPINE_RELEASE
  }
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/nginx:${name}", "quay.io/wener/nginx:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
  ]
}
