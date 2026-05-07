variable "IMAGE_NAME" {
  default = "mihomo"
}
variable "VERSION" { default = "" }
variable "ALPINE_RELEASE" { default = "" }
variable "GO_VERSION" { default = "1.25" }
variable "MIHOMO_REPO" { default = "https://github.com/wenerme/mihomo.git" }
variable "MIHOMO_BRANCH" { default = "develop" }
variable "MIHOMO_REV" { default = "fb5d1f3dae0317d625df9ea1a8394cc4491b87dc" }

group "default" {
  targets = ["mihomo"]
}

target "mihomo" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args = {
    ALPINE_RELEASE = ALPINE_RELEASE
    GO_VERSION     = GO_VERSION
    MIHOMO_REPO    = MIHOMO_REPO
    MIHOMO_BRANCH  = MIHOMO_BRANCH
    MIHOMO_REV     = MIHOMO_REV
  }
  tags = [
    "docker.io/wener/${IMAGE_NAME}:${VERSION}",
    "docker.io/wener/${IMAGE_NAME}:latest",
    "quay.io/wener/${IMAGE_NAME}:${VERSION}",
    "quay.io/wener/${IMAGE_NAME}:latest",
  ]
}
