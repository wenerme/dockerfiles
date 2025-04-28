variable "TAG" { default = "latest" }
variable "VERSION" {}
variable "IMAGE_NAME" { default = "tinyproxy" }
variable "ALPINE_RELEASE" {}

group "default" {
	targets = ["tinyproxy"]
}

target "tinyproxy" {
	context = "tinyproxy"
	tags = tags("latest")

	dockerfile = "Dockerfile"
	platforms = ["linux/amd64", "linux/arm64"]
	pull       = true
	args = {
		ALPINE_RELEASE = ALPINE_RELEASE
		VERSION        = VERSION
	}
}

function "tags" {
	params = [name]
	result = [
		"docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
		# "docker.io/wener/${IMAGE_NAME}:alpine-${ALPINE_RELEASE}", "quay.io/wener/${IMAGE_NAME}:alpine-${ALPINE_RELEASE}",
			notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
			notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
	]
}
