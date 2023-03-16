variable "TAG" {
  default = "latest"
}
variable "VERSION" {default="" }

group "default" {
  targets = ["frp","frps","frpc"]
}

target "frp" {
  context = "frp"
  tags = tags("frp")

  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  pull = true
}

target "frps" {
  inherits = ["frp"]
  context = "frps"
  tags = tags("frps")
}
target "frpc" {
  inherits = ["frp"]
  context = "frpc"
  tags = tags("frpc")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${name}:${TAG}","quay.io/wener/${name}:${TAG}",
    notequal("",VERSION) ? "docker.io/wener/${name}:${VERSION}": "",
    notequal("",VERSION) ? "quay.io/wener/${name}:${VERSION}": "",
  ]
}
