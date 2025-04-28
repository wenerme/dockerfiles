variable "VERSION" { default = "" }
group "default" {
  targets = ["pytorch"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  pull       = true
}

target "pytorch" {
  inherit = "base"
  context = "pytorch"
  tags = tags("pytorch", "2.5.1-py3.12")
  platforms = ["linux/amd64", "linux/arm64"]
  args = {
    TORCH_VERSION  = "2.5.1"
    PYTHON_VERSION = "3.12"
  }
}

function "tags" {
  params = [name, tag]
  result = [
      notequal(tag, "") ? "quay.io/wener/${name}:${tag}" : "",
  ]
}
