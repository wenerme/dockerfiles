variable "IMAGE_NAME" {
	default = "dante"
}
variable "TAG" {
	default = "latest"
}
variable "VERSION" { default = "" }
variable "ALPINE_RELEASE" { default = "" }
variable "ALPINE_VERSION" { default = "" }

group "default" {
	targets = ["dante"]
}

target "dante" {
	context = "dante"
	tags = tags("latest")

	dockerfile = "Dockerfile"
	#platforms = ["linux/amd64", "linux/arm64"]
	platforms = ["linux/amd64"]
	pull = true
	args = {
		ALPINE_RELEASE = ALPINE_RELEASE
		VERSION        = VERSION
	}
}


function "tags" {
	params = [name]
	result = [
		"docker.io/wener/${IMAGE_NAME}", "quay.io/wener/${IMAGE_NAME}",
			notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
			notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
	]
}
