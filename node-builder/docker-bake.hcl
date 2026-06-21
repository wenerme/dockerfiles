variable "IMAGE_NAME" { default = "node-builder" }
variable "VERSION" { default = "24.17.0" }
variable "VERSION_MAJOR" { default = split(".", VERSION)[0] }
variable "VERSION_MAJOR_MINOR" { default = "${split(".", VERSION)[0]}.${split(".", VERSION)[1]}" }
variable "ALPINE_RELEASE" { default = "3.24.1" }
variable "ALPINE_VERSION" { default = "3.24" }
variable "REV" { default = "0" }

variable "NPM_VERSION" { default = "11.17.0" }
variable "PNPM_VERSION" { default = "11.8.0" }
variable "YARN_VERSION" { default = "1.22.22" }
variable "BIOME_VERSION" { default = "2.5.0" }
variable "BUN_VERSION" { default = "1.3.14" }
variable "FULL_ICU_VERSION" { default = "1.6.0" }

group "default" {
  targets = ["node-builder"]
}

target "base" {
  context    = "node-builder"
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args = {
    ALPINE_RELEASE    = ALPINE_RELEASE
    ALPINE_VERSION    = ALPINE_VERSION
    VERSION           = VERSION
    NPM_VERSION       = NPM_VERSION
    PNPM_VERSION      = PNPM_VERSION
    YARN_VERSION      = YARN_VERSION
    BIOME_VERSION     = BIOME_VERSION
    BUN_VERSION       = BUN_VERSION
    FULL_ICU_VERSION  = FULL_ICU_VERSION
  }
  contexts = {
    "wener/base:${ALPINE_RELEASE}" = "docker-image://quay.io/wener/base:${ALPINE_RELEASE}"
  }
}

target "node-builder" {
  inherits = ["base"]
  tags     = tags("latest", VERSION, VERSION_MAJOR, VERSION_MAJOR_MINOR, ALPINE_VERSION)
}

function "tags" {
  params = [name, node_version, node_major, node_major_minor, alpine_version]
  result = distinct(compact([
    "docker.io/wener/${IMAGE_NAME}:${name}",
    "quay.io/wener/${IMAGE_NAME}:${name}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${name}",
    "docker.io/wener/${IMAGE_NAME}:${node_major}",
    "quay.io/wener/${IMAGE_NAME}:${node_major}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${node_major}",
    "docker.io/wener/${IMAGE_NAME}:${node_major_minor}",
    "quay.io/wener/${IMAGE_NAME}:${node_major_minor}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${node_major_minor}",
    "docker.io/wener/${IMAGE_NAME}:${node_version}",
    "quay.io/wener/${IMAGE_NAME}:${node_version}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${node_version}",
    "docker.io/wener/${IMAGE_NAME}:${node_version}-r${REV}",
    "quay.io/wener/${IMAGE_NAME}:${node_version}-r${REV}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${node_version}-r${REV}",
    "docker.io/wener/${IMAGE_NAME}:${node_version}-alpine-${alpine_version}-r${REV}",
    "quay.io/wener/${IMAGE_NAME}:${node_version}-alpine-${alpine_version}-r${REV}",
    "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${node_version}-alpine-${alpine_version}-r${REV}",
    notequal("latest", name) ? "docker.io/wener/${IMAGE_NAME}:${name}-alpine-${alpine_version}-r${REV}" : "",
    notequal("latest", name) ? "quay.io/wener/${IMAGE_NAME}:${name}-alpine-${alpine_version}-r${REV}" : "",
    notequal("latest", name) ? "ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${name}-alpine-${alpine_version}-r${REV}" : "",
  ]))
}
