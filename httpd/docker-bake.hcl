variable "TAG" {
  default = "latest"
}
variable "IMAGE_NAME" {
  default = "httpd"
}
variable "VERSION" {default="" }


group "default" {
  targets = ["httpd"]
}

target base {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  pull = true
}

target "httpd" {
  inherits = ["base"]
  context = "httpd"
  tags = tags("latest")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}","quay.io/wener/${IMAGE_NAME}:${name}",
    // name == latest
    notequal("",VERSION) ? "docker.io/wener/${IMAGE_NAME}:${VERSION}": "",
    notequal("",VERSION) ? "quay.io/wener/${IMAGE_NAME}:${VERSION}": "",
  ]
}
