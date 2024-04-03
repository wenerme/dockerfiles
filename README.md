# Dockerfiles

- https://quay.io/organization/wener
- https://hub.docker.com/u/wener

| image          | size  | base       | note                  |
|----------------|-------|------------|-----------------------|
| wener/base     | 7MB   |            | curl,fil,compact,bash |
| wener/app      | 8MB   | wener/base | openrc                |
| wener/app:ssh  | 27MB  | wener/app  | ssh server            |
| wener/xvfb     | 30MB  | wener/app  |                       |
| wener/chromium | 350MB | wener/xvfb |                       |
| wener/node     | 37MB  | wener/base |                       |
| wener/go       | 127MB | wener/base |                       |
| wener/go:win   | 372MB | wener/go   | mingw                 |
| wener/nginx    | 8MB   | wener/base |                       |

很多常用的镜像,与其他相同的镜像相比有如下特点

* 使用 alpine 作为基础镜像
* 使用国内镜像
  * alpine
    * 上海交大 https://mirrors.sjtug.sjtu.edu.cn/alpine/
      * 目前主要使用
    * TUNA 镜像 https://mirrors.tuna.tsinghua.edu.cn/alpine
    * 阿里云镜像 http://mirrors.aliyun.com/alpine
  * ubuntu
  * node
  * maven
* 基于 Github 提交自动构建
* 提供非常方便的构建脚本
* 所有镜像均可在 docker hub 上访问
* 默认所有镜像为 amd64
* 多架构
  * linux/amd64
  * linux/arm64

## Dockerfiles

### Base

* base
  * v3.9
  * Mirror https://mirrors.tuna.tsinghua.edu.cn/alpine
  * Package: curl busybox-extras file
  * :multiarch
    * Tools for multiarch
  * :bash
    * Bash as default shell
  * :armhf
  * :aarch64
  * :ppc64le
  * :s390x
* edge
  * FROM alpine:edge
  * Mirror http://mirrors.aliyun.com/alpine
* ubuntu
  * Mirror http://mirrors.aliyun.com/ubuntu/

### Languages

* java
  * FROM base:bash
  * OpenJDK 8
  * :maven
    * With Maven
* node
  * FROM base
  * yarn
  * Mirror https://registry.npm.taobao.org
* php
  * :5
  * :php
    * PHP 7
  * :builder
    * Use this to build module
  * :app
    * With pre-build module
      * redis
      * mongodb
      * grpc

### Dev Tool

* builder
  * FROM java:maven
  * devtools for build projects
  * docker
  * gcc
  * python
  * node
  * golang

* grpc
  * FROM wener/base:util
  * grpc code generator
  * languages
    * ruby
    * php
    * cpp
    * objc
    * js
    * csharp
    * python
    * golang
    * java
    * [ ] dart
    * [ ] swift
  * utils
    * protowrap
      * Generate multi package for golang in one command
    * [ ] proto-gen-slate
      * Generate slate document for grpc

### Tool

* autossh
  * FROM base
* media
  * ffmpeg
  * youtube-dl

### Application

* zentao
  * FROM ubuntu
  * zentao 8.3.1
  * 禅道

### Server

* jenkins
  * Jenkins CI/CD server
* nginx
  * FROM base
  * nginx-lua
  * :stream
    * With stream module
* caddy
  * FROM base
  * full
    * With all plugins
  * php
    * FROM full
    * php7-fpm
* samba
  * Samba Server & Client
* dante
  * Socks proxy server
* tinc
  * tinc server
* privoxy
  * HTTP proxy server
* pdns
  * FROM base
  * PowerDNS
  * PowerDNS Recursor
  * all backend

## Multiarch

```bash
# Register
docker run --rm -it --priviliged wener/base:multiarch register
# Run different arch on x86_64
docker run --rm -it wener/base:armhf uname -a
docker run --rm -it wener/base:s360x apk --print-arch
```

## Development

```bash
# Show help message
HELP=1 ./build.sh
# Build image and push
./build.sh mongo
# Skip push
BUILD_SKIP_PUSH=1 ./build.sh mongo
```

## FAQ

### No permission to apply cgroup settings

When using openrc in docker, will throw this error, it's ok.

### multi arch

* manifest 文件位于 `$HOME/.docker/manifests`

```bash
# build different arch
GROUP=warm32v7 ./build.sh

# create manifest
./.build/archs.sh base bash
```

## Local Load

```bash
docker save wener/gitlab-runner | pv | ssh admin@host 'docker load'
```

## 缓存问题

multiarch 下不可以 `--mount=type=cache,target=/etc/apk/cache`

## bake

- https://github.com/docker/buildx/blob/master/bake/hclparser/stdlib.go
