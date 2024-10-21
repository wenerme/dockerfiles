variable "TAG" {
  default = "latest"
}
variable "VERSION" { default = "" }

group "default" {
  targets = ["web"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64"] // , "linux/arm64"
  pull       = true
}

target "web" {
  inherits = ["base"]
  context  = "."
  tags     = tags("web")
}

function "tags" {
  params = [name]
  result = [
    "github.com/wenerme/app-${name}:${TAG}",
  ]
}
