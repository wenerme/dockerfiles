variable "TAG" { default = "latest" }
variable "IMAGE_NAME" { default = "php" }
variable "VERSION" { default = "" }
variable "ALPINE_RELEASE" { default = "3.18.3" }
variable "ALPINE_VERSION" { default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}" }

// Historical variants keep their own Alpine branch, independently of the repository default.
variable "PHP81_ALPINE_RELEASE" { default = "3.19.1" }
variable "PHP82_ALPINE_RELEASE" { default = "3.19.1" }
variable "PHP83_ALPINE_RELEASE" { default = "3.24.2" }
variable "PHP84_ALPINE_RELEASE" { default = "3.24.2" }
variable "PHP85_ALPINE_RELEASE" { default = "3.24.2" }
variable "PHP82_VERSION" { default = "8.2.26-r0" }
variable "PHP83_VERSION" { default = "8.3.36-r0" }
variable "PHP84_VERSION" { default = "8.4.27-r0" }
variable "PHP85_VERSION" { default = "8.5.12-r0" }
variable "PHP82_REV" { default = "0" }
variable "PHP83_REV" { default = "0" }
variable "PHP84_REV" { default = "0" }
variable "PHP85_REV" { default = "0" }

group "default" {
	targets = [
		// "81", // 3.19 only
		"82",
		"83",
		"84",
		"85",
	]
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

target "7" {
	inherits = ["base"]
	context    = "."
	dockerfile = "7/Dockerfile"
	tags = tags("7")
}
target "81" {
	inherits = ["base"]
	context    = "."
	dockerfile = "8.1/Dockerfile"
	tags = tags("8.1")
	args = {
		ALPINE_RELEASE = PHP81_ALPINE_RELEASE
		ALPINE_VERSION = "${split(".", PHP81_ALPINE_RELEASE)[0]}.${split(".", PHP81_ALPINE_RELEASE)[1]}"
	}
}

target "82" {
	inherits = ["base"]
	context    = "."
	dockerfile = "8.2/Dockerfile"
	tags = release_tags("8.2", PHP82_VERSION, PHP82_ALPINE_RELEASE, PHP82_REV)
	args = {
		ALPINE_RELEASE = PHP82_ALPINE_RELEASE
		ALPINE_VERSION = "${split(".", PHP82_ALPINE_RELEASE)[0]}.${split(".", PHP82_ALPINE_RELEASE)[1]}"
		PHP_VERSION = PHP82_VERSION
	}
	contexts = {
		"wener/nginx:alpine-${PHP82_ALPINE_RELEASE}" = "docker-image://quay.io/wener/nginx:alpine-${PHP82_ALPINE_RELEASE}"
	}
}

target "83" {
	inherits = ["base"]
	context    = "."
	dockerfile = "8.3/Dockerfile"
	tags = release_tags("8.3", PHP83_VERSION, PHP83_ALPINE_RELEASE, PHP83_REV)
	args = {
		ALPINE_RELEASE = PHP83_ALPINE_RELEASE
		ALPINE_VERSION = "${split(".", PHP83_ALPINE_RELEASE)[0]}.${split(".", PHP83_ALPINE_RELEASE)[1]}"
		PHP_VERSION = PHP83_VERSION
	}
}

target "84" {
	inherits = ["base"]
	context    = "."
	dockerfile = "8.4/Dockerfile"
	tags = release_tags("8.4", PHP84_VERSION, PHP84_ALPINE_RELEASE, PHP84_REV)
	args = {
		ALPINE_RELEASE = PHP84_ALPINE_RELEASE
		ALPINE_VERSION = "${split(".", PHP84_ALPINE_RELEASE)[0]}.${split(".", PHP84_ALPINE_RELEASE)[1]}"
		PHP_VERSION = PHP84_VERSION
	}
}

target "85" {
	inherits = ["base"]
	context    = "."
	dockerfile = "8.5/Dockerfile"
	tags = release_tags("8.5", PHP85_VERSION, PHP85_ALPINE_RELEASE, PHP85_REV)
	args = {
		ALPINE_RELEASE = PHP85_ALPINE_RELEASE
		ALPINE_VERSION = "${split(".", PHP85_ALPINE_RELEASE)[0]}.${split(".", PHP85_ALPINE_RELEASE)[1]}"
		PHP_VERSION = PHP85_VERSION
	}
}

target "8" {
	inherits = ["base"]
	context    = "."
	dockerfile = "8/Dockerfile"
	tags = tags("8")
}

target "7-composer" {
	inherits = ["base"]
	context = "7-composer"
	tags = tags("7-composer")
	contexts = {
		"wener/php:7" : "target:7",
	}
}

function "release_tags" {
	params = [name, version, alpine, revision]
	result = concat(tags(name), [
		"docker.io/wener/${IMAGE_NAME}:${name}-alpine-${alpine}",
		"quay.io/wener/${IMAGE_NAME}:${name}-alpine-${alpine}",
		"docker.io/wener/${IMAGE_NAME}:${name}-${version}-alpine-${alpine}-r${revision}",
		"quay.io/wener/${IMAGE_NAME}:${name}-${version}-alpine-${alpine}-r${revision}",
	])
}

function "tags" {
	params = [name]
	result = [
		"docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
	]
}
