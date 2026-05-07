variable "IMAGE_NAME" { default = "postgres" }

variable "PG_VERSION" { default = "18.3" }
variable "PG_MAJOR" { default = split(".", PG_VERSION)[0] }
variable "PG_REVISION" { default = "1" }

variable "WRAPPERS_REPO" { default = "https://github.com/wenerme/wrappers.git" }
variable "WRAPPERS_BRANCH" { default = "develop" }
variable "WRAPPERS_REV" { default = "ddf5a2d6850ec47fcee2a1a9b1c1582e5eb1141a" }
variable "PGVECTOR_VERSION" { default = "0.8.2" }
variable "PG_CRON_VERSION" { default = "1.6.7" }
variable "PG_TLE_VERSION" { default = "1.5.2" }
variable "PG_STAT_MONITOR_VERSION" { default = "2.3.2" }
variable "PGAUDIT_VERSION" { default = "18.0" }
variable "PG_HASHIDS_VERSION" { default = "1.2.1" }
variable "PGSQL_HTTP_VERSION" { default = "1.7.0" }
variable "PG_NET_VERSION" { default = "0.20.2" }
variable "PG_REPACK_VERSION" { default = "1.5.3" }
variable "PG_PARTMAN_VERSION" { default = "5.4.3" }
variable "PGMQ_VERSION" { default = "1.11.0" }
variable "TIMESCALEDB_VERSION" { default = "2.26.1" }
variable "PLJS_REPO" { default = "https://github.com/wenerme/pljs.git" }
variable "PLJS_BRANCH" { default = "develop" }
variable "DUCKDB_VERSION" { default = "v1.4.4" }

group "default" {
	targets = ["postgres"]
}

target "base" {
	dockerfile = "Dockerfile"
	platforms = ["linux/amd64", "linux/arm64"]
	pull       = true
	args = {
		PG_VERSION              = PG_MAJOR
		WRAPPERS_REPO           = WRAPPERS_REPO
		WRAPPERS_BRANCH         = WRAPPERS_BRANCH
		WRAPPERS_REV            = WRAPPERS_REV
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

		"docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_MAJOR}",
		"quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_MAJOR}",

		"docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_VERSION}-r${PG_REVISION}",
		"quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${PG_VERSION}-r${PG_REVISION}",
	]
}
