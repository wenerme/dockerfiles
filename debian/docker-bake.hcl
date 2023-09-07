target "base" {
  dockerfile = "Dockerfile"
  #platforms  = equal("", DEV) ? ["linux/amd64", "linux/arm64"] : ["linux/amd64"]
  platforms  = ["linux/amd64"]
  context  = "debian"
  pull       = true
}

group "default" {
  targets = ["bookworm-backports"]
}

target "bookworm-backports" {
  inherits = ["base"]
  tags     = tags("bookworm-backports")
  args     = {
    VERSION = "bookworm-backports"
  }
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/debian:${name}","quay.io/wener/debian:${name}",
  ]
}
