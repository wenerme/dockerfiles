variable "IMAGE_NAME" { default = "postgres" }

# Full PostgreSQL release; manifest.yaml binds its app version here. Not named PG_VERSION:
# that Dockerfile arg is the major version used for pgrx features (pg18).
variable "POSTGRES_VERSION" { default = "18.6" }
variable "PG_MAJOR" { default = split(".", POSTGRES_VERSION)[0] }
variable "PG_IMAGE_VERSION" { default = POSTGRES_VERSION }
variable "PG_ALPINE_VERSION" { default = "3.24" }
variable "PG_REVISION" { default = "1" }

# Source pins: fetched by exact commit.
variable "WRAPPERS_REPO" { default = "https://github.com/wenerme/wrappers.git" }
variable "WRAPPERS_REV" { default = "ecafbf1979af81a18bcb57d790bd167208d3ffa0" }
variable "PLJS_REPO" { default = "https://github.com/wenerme/pljs.git" }
variable "PLJS_REV" { default = "d59634ed2fe98d6342956a79af5be0874d811a5f" }
variable "PG_WODEKIT_REV" { default = "65fbc46b79dbce692a7ec8bbeb2f2ae5016cc4b4" }
# wrappers requirements: its pgrx pin, workspace rust-version and bundled DuckDB (checked in the build).
variable "PGRX_VERSION" { default = "0.19.2" }
variable "RUST_VERSION" { default = "1.97.1" }
variable "DUCKDB_VERSION" { default = "v1.5.6" }
# Versions installed by earlier images; kept loadable and given an update path.
variable "WRAPPERS_OLD_VERSIONS" { default = "0.6.0" }

variable "PGVECTOR_VERSION" { default = "0.8.7" }
variable "PG_CRON_VERSION" { default = "1.6.8" }
variable "PG_TLE_VERSION" { default = "1.5.3" }
variable "PG_STAT_MONITOR_VERSION" { default = "2.4.0" }
variable "PGAUDIT_VERSION" { default = "18.0" }
variable "PG_HASHIDS_VERSION" { default = "1.2.1" }
variable "PGSQL_HTTP_VERSION" { default = "1.7.2" }
variable "PG_NET_VERSION" { default = "0.20.5" }
variable "PG_REPACK_VERSION" { default = "1.5.3" }
variable "PG_PARTMAN_VERSION" { default = "5.5.0" }
variable "PGMQ_VERSION" { default = "1.13.1" }
variable "TIMESCALEDB_VERSION" { default = "2.31.0" }
variable "PGSODIUM_VERSION" { default = "3.1.11" }
variable "VAULT_VERSION" { default = "0.3.2" }

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
		WRAPPERS_REV            = WRAPPERS_REV
		PLJS_REPO               = PLJS_REPO
		PLJS_REV                = PLJS_REV
		PG_WODEKIT_REV          = PG_WODEKIT_REV
		PGRX_VERSION            = PGRX_VERSION
		RUST_VERSION            = RUST_VERSION
		DUCKDB_VERSION          = DUCKDB_VERSION
		WRAPPERS_OLD_VERSIONS   = WRAPPERS_OLD_VERSIONS
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
		PGSODIUM_VERSION        = PGSODIUM_VERSION
		VAULT_VERSION           = VAULT_VERSION
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

		"docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${POSTGRES_VERSION}-r${PG_REVISION}",
		"quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${POSTGRES_VERSION}-r${PG_REVISION}",
		"ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${POSTGRES_VERSION}-r${PG_REVISION}",

		"docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${POSTGRES_VERSION}-alpine-${PG_ALPINE_VERSION}-r${PG_REVISION}",
		"quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${POSTGRES_VERSION}-alpine-${PG_ALPINE_VERSION}-r${PG_REVISION}",
		"ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}${POSTGRES_VERSION}-alpine-${PG_ALPINE_VERSION}-r${PG_REVISION}",

		"docker.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${PG_ALPINE_VERSION}",
		"quay.io/wener/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${PG_ALPINE_VERSION}",
		"ghcr.io/wenerme/dockerfiles/${IMAGE_NAME}:${notequal("latest", name) ? "${name}-" : ""}alpine-${PG_ALPINE_VERSION}",
	]
}
