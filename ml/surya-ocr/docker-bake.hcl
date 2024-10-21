variable "IMAGE_TAG" { default = "latest" }
variable "IMAGE_NAME" { default = "surya-ocr" }
variable "VERSION" { default = "" }
group "default" {
  targets = ["base"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64"] // , "linux/arm64"
  context    = "."
  pull       = true
  tags = tags("latest")
}

function "tags" {
  params = [name]
  result = [
    # "hub.docker.com/wener/${IMAGE_NAME}:${TAG}",
      notequal(IMAGE_TAG, "") ? "quay.io/wener/${IMAGE_NAME}:${IMAGE_TAG}" : "",
      notequal(VERSION, "") ? "quay.io/wener/${IMAGE_NAME}:${VERSION}" : "",
  ]
}
