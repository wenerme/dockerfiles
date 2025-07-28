variable "IMAGE_NAME" { default = "app" }
variable "TAG" { default = "latest" }

variable "ALPINE_RELEASE" {
	default = "3.18.0"
}
variable "ALPINE_VERSION" {
	default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}"
}

group "default" {
	targets = ["app", "ssh"]
}

target "base" {
	dockerfile = "Dockerfile"
	platforms = ["linux/amd64", "linux/arm64"]
	pull       = true
	args = {
		ALPINE_RELEASE = ALPINE_RELEASE
		ALPINE_VERSION = ALPINE_VERSION
	}
}

target "app" {
	inherits = ["base"]
	context = "app"
	tags = tags("app")
}

target "workspace" {
	inherits = ["base"]
	context = "workspace"
	tags = tags("workspace")
	contexts = {
		"wener/ssh:${ALPINE_RELEASE}" : "target:ssh"
	}
}

target "ssh" {
	inherits = ["base"]
	context = "ssh"
	tags = tags("ssh")
	contexts = {
		"wener/app:${ALPINE_RELEASE}" : "target:app"
	}
}

function "tags" {
	params = [name]

	result = notequal(IMAGE_NAME, name) ? [
		"docker.io/wener/${IMAGE_NAME}:${ALPINE_RELEASE}-${name}", "quay.io/wener/${IMAGE_NAME}:${ALPINE_RELEASE}-${name}",
		"docker.io/wener/${IMAGE_NAME}:${ALPINE_VERSION}-${name}", "quay.io/wener/${IMAGE_NAME}:${ALPINE_VERSION}-${name}",
		"docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
	] : [
		"docker.io/wener/${IMAGE_NAME}:${ALPINE_RELEASE}", "quay.io/wener/${IMAGE_NAME}:${ALPINE_RELEASE}",
		"docker.io/wener/${IMAGE_NAME}:${ALPINE_VERSION}", "quay.io/wener/${IMAGE_NAME}:${ALPINE_VERSION}",
		"docker.io/wener/${IMAGE_NAME}", "quay.io/wener/${IMAGE_NAME}",
	]
}
