variable "TAG" {
  default = "latest"
}
variable "VERSION" {default="" }

group "default" {
  targets = ["nginx"]
}

target "nginx" {
  context = "nginx"
  tags = tags("latest")

  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  pull = true
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/nginx:${name}","quay.io/wener/nginx:${name}",
  ]
}
