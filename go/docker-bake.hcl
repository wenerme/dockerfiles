variable "IMAGE_NAME" { default = "go" }
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

target "base" {
	dockerfile = "Dockerfile"
	platforms = ["linux/amd64", "linux/arm64"]
	pull       = true
	args = {
		ALPINE_RELEASE     = ALPINE_RELEASE
		GO_PACKAGE_VERSION = GO_PACKAGE_VERSION
	}
}

group "default" {
	targets = ["go"]
}

target "go" {
	inherits = ["base"]
	context = "go"
	tags = tags("latest")
}

target "win" {
	inherits = ["base"]
	context = "win"
	tags = tags("win")
	platforms = ["linux/amd64"]
	args = {
		VERSION = GO_PACKAGE_VERSION
	}
	contexts = {
		"wener/go:${GO_PACKAGE_VERSION}" : "target:go",
	}
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
