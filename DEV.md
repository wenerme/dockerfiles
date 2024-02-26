## common bake

- ALPINE_RELEASE - major.minor.patch
- ALPINE_VERSION - major.minor

```hcl
variable "IMAGE_NAME" { default = "gitea-runner" }
variable "VERSION" { default = "" }
variable "ALPINE_RELEASE" { default = "3.19.1" }
variable "ALPINE_VERSION" { default = "${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}" }

target "base" {
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  pull       = true
  args       = {
    ALPINE_RELEASE = ALPINE_RELEASE
    ALPINE_VERSION = ALPINE_VERSION
    VERSION        = VERSION
  }
}

target "default" {
  inherits = ["base"]
  context  = "gitea-runner"
  tags     = tags("latest")
}

function "tags" {
  params = [name]
  result = [
    "docker.io/wener/${IMAGE_NAME}:${name}", "quay.io/wener/${IMAGE_NAME}:${name}",
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}" : "",
    # include base version
    notequal("", VERSION) ? "docker.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}-alpine-${ALPINE_RELEASE}" : "",
    notequal("", VERSION) ? "quay.io/wener/${IMAGE_NAME}:${notequal("latest", name)?"${name}-":""}${VERSION}-alpine-${ALPINE_RELEASE}" : "",
  ]
}
```

## common dockerfile

```dockerfile
ARG VERSION
ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

ARG TARGETARCH
ARG TARGETVARIANT

# apk cache for different arch
RUN --mount=type=cache,id=apk-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache
```

## image tags

- `:MAJOR.MINOR`
- `:MAJOR.MINOR.PATCH`
- `:alpine-MAJOR.MINOR.PATCH`
  - based on alpine version
  - e.g. openrc, xvfb, ssh, builder
- `:MAJOR.MINOR-alpine-MAJOR.MINOR.PATCH`
  - include base alpine version
  - e.g. gitea runner
  - runtime + env
