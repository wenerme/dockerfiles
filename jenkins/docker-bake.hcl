
variable "IMAGE_NAME" {
  default = "jenkins"
}
variable "VERSION" {default="" }

group "default" {
  targets = ["agent"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64"]
  pull = true
}

target "agent" {
  inherits = ["base"]
  context = "agent"
  tags = tags("agent")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}","quay.io/wener/${IMAGE_NAME}:${name}",
    notequal("",VERSION) ? "docker.io/wener/${IMAGE_NAME}:${name}-${VERSION}": "",
    notequal("",VERSION) ? "quay.io/wener/${IMAGE_NAME}:${name}-${VERSION}": "",
  ]
}
