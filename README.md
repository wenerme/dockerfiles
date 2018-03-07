# Dockerfiles

[![Build Status](https://travis-ci.org/wenerme/dockerfiles.svg?branch=master)](https://travis-ci.org/wenerme/dockerfiles)

很多常用的镜像,与其他相同的镜像相比有如下特点

* 使用国内镜像
  * ubuntu
  * alpine
  * node
  <!--* maven-->
* 尽可能的使用 alpine 作为基础镜像
* 基于 Github 提交自动构建
* 提供非常方便的构建脚本
* 所有镜像均可在 docker hub 上访问
* 默认所有镜像为 amd64
* [ ] 支持多架构
  * [ ] arm

## Dockerfiles
* base
  * FROM alpine:3.5
  * Mirror http://mirrors.aliyun.com/alpine
  * Package: openssh-client curl busybox file
  * Link /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2, can run go binary.
  * :bash
    * Bash as default shell
* edge
  * FROM alpine:edge
  * Mirror http://mirrors.aliyun.com/alpine
* nginx
  * FROM base
  * nginx-lua
* java
  * FROM base:bash
  * OpenJDK 8
  * :maven
    * Maven 3.3.9
* ubuntu
  * Mirror http://mirrors.aliyun.com/ubuntu/
* zentao
  * FROM ubuntu
  * zentao 8.3.1
* node
  * FROM base
  * yarn
  * Mirror https://registry.npm.taobao.org
* caddy
  * base
  * full
    * With all plugins
  * dns
    * FROM full
    * DNS
  * php
    * FROM full
    * php7-fpm
* builder
  * FROM java:maven
  * devtools for build projects
  * docker
  * gcc
  * python
  * node
  * golang
* pdns
  * FROM base
  * PowerDNS
  * backend mysql,sqlite,pgsql
  * PowerDNS Recursor
* autossh
  * FROM base
* [ ] shadowsocks
  * manager
* php
  * :5
  * :php
    * PHP 7
  * :builder
    * Use this to builder module
  * :app
    * With pre-build module
      * redis
      * mongodb
      * grpc

## Dev

```bash
# Show help message
HELP=1 ./build.sh
# Build image and push
./build.sh mongo
# Skip push
BUILD_SKIP_PUSH=1 ./build.sh mongo
```
