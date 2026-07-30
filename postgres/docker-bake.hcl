variable "IMAGE_NAME" { default = "postgres" }

variable "PG_VERSION" { default = "18.4" }
variable "PG_MAJOR" { default = split(".", PG_VERSION)[0] }
variable "PG_IMAGE_VERSION" { default = PG_VERSION }
variable "PG_ALPINE_VERSION" { default = "3.24" }
variable "PG_REVISION" { default = "0" }

variable "WRAPPERS_REPO" { default = "https://github.com/wenerme/wrappers.git" }
variable "WRAPPERS_BRANCH" { default = "develop" }
variable "WRAPPERS_REV" { default = "51f30aedf12d74db4c58b2073868ec8f161e703a" }
variable "PGRX_VERSION" { default = "0.19.1" }
variable "PGVECTOR_VERSION" { default = "0.8.3" }
variable "PG_CRON_VERSION" { default = "1.6.7" }
variable "PG_TLE_VERSION" { default = "1.5.2" }
variable "PG_STAT_MONITOR_VERSION" { default = "2.3.2" }
variable "PGAUDIT_VERSION" { default = "18.0" }
variable "PG_HASHIDS_VERSION" { default = "1.2.1" }
variable "PGSQL_HTTP_VERSION" { default = "1.7.1" }
variable "PG_NET_VERSION" { default = "0.20.3" }
variable "PG_REPACK_VERSION" { default = "1.5.3" }
variable "PG_PARTMAN_VERSION" { default = "5.4.3" }
variable "PGMQ_VERSION" { default = "1.11.1" }
variable "TIMESCALEDB_VERSION" { default = "2.28.1" }
variable "PLJS_REPO" { default = "https://github.com/wenerme/pljs.git" }
variable "PLJS_BRANCH" { default = "develop" }
variable "DUCKDB_VERSION" { default = "v1.5.4" }

group "default" {
	targets = ["postgres"]
}

target "base" {
	dockerfile = "Dockerfile"
	platforms = ["linux/amd64", "linux/arm64"]
	pull       = true
	args = {
		PG_VERSION              = PG_MAJOR
		PG_IMAGE_VERSION        = PG_IMAGE_VERSION
		PG_ALPINE_VERSION       = PG_ALPINE_VERSION
		WRAPPERS_REPO           = WRAPPERS_REPO
		WRAPPERS_BRANCH         = WRAPPERS_BRANCH
		WRAPPERS_REV            = WRAPPERS_REV
		PGRX_VERSION            = PGRX_VERSION
		PGVECTOR_VERSION        = PGVECTOR_VERSION
		PG_CRON_VERSION         = PG_CRON_VERSION
		PG_TLE_VERSION          = PG_TLE_VERSION
		PG_STAT_MONITOR_VERSION = PG_STAT_MONITOR_VERSION
		PGAUDIT_VERSION         = PGAUDIT_VERSION
		PG_HASHIDS_VERSION      = PG_HASHIDS_VERSION
		PGSQL_HTTP_VERSION      = PGSQL_HTTP_VERSION
		PG_NET_VERSION          = PG_NET_VERSION
		PG_REPACK_VERSION       = PG_REPACK_VERSION
		PG_PARTMAN_VERSION      = PG_PARTMAN_VERSION
		PGMQ_VERSION            = PGMQ_VERSION
		TIMESCALEDB_VERSION     = TIMESCALEDB_VERSION
		PLJS_REPO               = PLJS_REPO
		PLJS_BRANCH             = PLJS_BRANCH
		DUCKDB_VERSION          = DUCKDB_VERSION
	}
}

target "postgres" {
	inherits = ["base"]
	context = "postgres"
	tags = tags("latest")
}

function "tags" {
	params = [name]
	result = [
		"docker.io/wener/${IMAGE_NAME}:${name}",
		"quay.io/wener/${IMAGE_NAME}:${name}",
		"ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${name}",

		"docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_MAJOR}",
		"quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_MAJOR}",
		"ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_MAJOR}",

		"docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_VERSION}-r${PG_REVISION}",
		"quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_VERSION}-r${PG_REVISION}",
		"ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_VERSION}-r${PG_REVISION}",

		"docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_VERSION}-alpine-${PG_ALPINE_VERSION}-r${PG_REVISION}",
		"quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_VERSION}-alpine-${PG_ALPINE_VERSION}-r${PG_REVISION}",
		"ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_VERSION}-alpine-${PG_ALPINE_VERSION}-r${PG_REVISION}",

		"docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${PG_ALPINE_VERSION}",
		"quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${PG_ALPINE_VERSION}",
		"ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${PG_ALPINE_VERSION}",
	]
}
