variable "IMAGE_NAME" { default = "go-builder" }
variable "GO_VERSION" { default = "1.26" }
variable "ALPINE_VERSION" { default = "3.24" }
variable "REV" { default = "0" }

variable "PROTOC_VERSION" { default = "35.1" }
variable "BUF_VERSION" { default = "v1.71.0" }
variable "PROTOC_GEN_GO_VERSION" { default = "v1.36.11" }
variable "PROTOC_GEN_GO_GRPC_VERSION" { default = "v1.6.2" }
variable "PROTOC_GEN_GO_HTTP_VERSION" { default = "v2.0.0-20260404020628-f149714c1d54" }
variable "PROTOC_GEN_OPENAPI_VERSION" { default = "v0.7.1" }
variable "WIRE_VERSION" { default = "v0.7.0" }
variable "GOIMPORTS_VERSION" { default = "v0.46.0" }
variable "GOFUMPT_VERSION" { default = "v0.10.0" }
variable "GOVULNCHECK_VERSION" { default = "v1.4.0" }
variable "GOLANGCI_LINT_VERSION" { default = "v2.12.2" }
variable "GOTESTSUM_VERSION" { default = "v1.13.0" }

variable "GO_125_VERSION" { default = "1.25.11" }
variable "GO_125_ALPINE_VERSION" { default = "3.23" }

group "default" {
  targets = ["go-builder"]
}

target "base" {
  context    = "go-builder"
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args = {
    GO_VERSION                   = GO_VERSION
    ALPINE_VERSION               = ALPINE_VERSION
    PROTOC_VERSION               = PROTOC_VERSION
    BUF_VERSION                  = BUF_VERSION
    PROTOC_GEN_GO_VERSION        = PROTOC_GEN_GO_VERSION
    PROTOC_GEN_GO_GRPC_VERSION   = PROTOC_GEN_GO_GRPC_VERSION
    PROTOC_GEN_GO_HTTP_VERSION   = PROTOC_GEN_GO_HTTP_VERSION
    PROTOC_GEN_OPENAPI_VERSION   = PROTOC_GEN_OPENAPI_VERSION
    WIRE_VERSION                 = WIRE_VERSION
    GOIMPORTS_VERSION            = GOIMPORTS_VERSION
    GOFUMPT_VERSION              = GOFUMPT_VERSION
    GOVULNCHECK_VERSION          = GOVULNCHECK_VERSION
    GOLANGCI_LINT_VERSION        = GOLANGCI_LINT_VERSION
    GOTESTSUM_VERSION            = GOTESTSUM_VERSION
  }
}

target "go-builder" {
  inherits = ["base"]
  tags     = tags("latest", GO_VERSION, ALPINE_VERSION)
}

target "go-builder-1-25" {
  inherits = ["base"]
  args = {
    GO_VERSION     = GO_125_VERSION
    ALPINE_VERSION = GO_125_ALPINE_VERSION
  }
  tags = tags("1.25", GO_125_VERSION, GO_125_ALPINE_VERSION)
}

function "tags" {
  params = [name, go_version, alpine_version]
  result = distinct(compact([
    "docker.io/wener/${IMAGE_NAME}:${name}",
    "quay.io/wener/${IMAGE_NAME}:${name}",
    "docker.io/wener/${IMAGE_NAME}:${go_version}",
    "quay.io/wener/${IMAGE_NAME}:${go_version}",
    "docker.io/wener/${IMAGE_NAME}:${go_version}-r${REV}",
    "quay.io/wener/${IMAGE_NAME}:${go_version}-r${REV}",
    "docker.io/wener/${IMAGE_NAME}:${go_version}-alpine-${alpine_version}-r${REV}",
    "quay.io/wener/${IMAGE_NAME}:${go_version}-alpine-${alpine_version}-r${REV}",
    notequal("latest", name) ? "docker.io/wener/${IMAGE_NAME}:${name}-alpine-${alpine_version}-r${REV}" : "",
    notequal("latest", name) ? "quay.io/wener/${IMAGE_NAME}:${name}-alpine-${alpine_version}-r${REV}" : "",
  ]))
}
