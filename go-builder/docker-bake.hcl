variable "IMAGE_NAME" { default = "go-builder" }
variable "GO_PACKAGE_VERSION" {
  default = "1.26.3-r0"
  validation {
    condition     = GO_PACKAGE_VERSION != ""
    error_message = "GO_PACKAGE_VERSION must not be empty."
  }
  validation {
    condition     = GO_PACKAGE_VERSION == regex("^[0-9]+\\.[0-9]+\\.[0-9]+-r[0-9]+$", GO_PACKAGE_VERSION)
    error_message = "GO_PACKAGE_VERSION must be a major.minor.patch-rN APK version."
  }
}
variable "ALPINE_RELEASE" { default = "3.24.1" }
variable "REV" { default = "0" }
variable "GO_BASE_IMAGE" { default = "wener/go:${GO_PACKAGE_VERSION}-alpine-${ALPINE_RELEASE}-r${REV}" }

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
variable "MAGE_VERSION" { default = "v1.17.2" }
variable "GOCOVER_COBERTURA_VERSION" { default = "v1.5.0" }
variable "GOLANGCI_LINT_VERSION" { default = "v2.12.2" }
variable "GOTESTSUM_VERSION" { default = "v1.13.0" }

group "default" {
  targets = ["go-builder"]
}

target "go-builder" {
  context    = "go-builder"
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  args = {
    GO_BASE_IMAGE                = GO_BASE_IMAGE
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
    MAGE_VERSION                 = MAGE_VERSION
    GOCOVER_COBERTURA_VERSION    = GOCOVER_COBERTURA_VERSION
    GOLANGCI_LINT_VERSION        = GOLANGCI_LINT_VERSION
    GOTESTSUM_VERSION            = GOTESTSUM_VERSION
  }
  tags = tags("latest")
}

function "tags" {
  params = [name]
  result = distinct([
    "docker.io/wener/${IMAGE_NAME}:${name}",
    "quay.io/wener/${IMAGE_NAME}:${name}",
    "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${GO_PACKAGE_VERSION}",
    "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${GO_PACKAGE_VERSION}",
    "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${GO_PACKAGE_VERSION}-alpine-${ALPINE_RELEASE}-r${REV}",
    "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${GO_PACKAGE_VERSION}-alpine-${ALPINE_RELEASE}-r${REV}",
  ])
}
