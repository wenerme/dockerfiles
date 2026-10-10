variable "IMAGE_NAME" { default = "ligolo-ng" }
variable "VERSION" { default = "0.8.3" }
variable "ALPINE_RELEASE" { default = "" }
variable "GO_VERSION" { default = "1.25" }
variable "LIGOLO_REPO" { default = "https://github.com/nicocha30/ligolo-ng.git" }
variable "LIGOLO_BRANCH" { default = "master" }
variable "LIGOLO_REV" { default = "913fe64e088d5db2185d392965bf4cd3dd1d9495" }

// Set TAG when you want to publish a non-latest alias, e.g. TAG=0.8.3.
variable "TAG" { default = "latest" }

group "default" {
  targets = ["ligolo-ng"]
}

target "ligolo-ng" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args = {
    ALPINE_RELEASE = ALPINE_RELEASE
    GO_VERSION     = GO_VERSION
    LIGOLO_REPO    = LIGOLO_REPO
    LIGOLO_BRANCH  = LIGOLO_BRANCH
    LIGOLO_REV     = LIGOLO_REV
    VERSION        = VERSION
  }
  tags = tags(IMAGE_NAME)
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${name}:${TAG}",
    "quay.io/wener/${name}:${TAG}",
    notequal("", VERSION) ? "docker.io/wener/${name}:${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${name}:${VERSION}" : "",
  ]
}
