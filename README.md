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

## Dockerfiles
* base
    * alpine:3.5
    * Mirror http://mirrors.aliyun.com/alpine
    * Package: openssh-client curl busybox file
    * Link /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2, can run go binary.
    * [ ] :bash
        * Bash as default shell
* edge
    * alpine:edge
    * Mirror http://mirrors.aliyun.com/alpine
* nginx
    * base
    * nginx-lua
* java
    * base
    * OpenJDK 8
    * Maven 3.3.9
* ubuntu
    * Mirror http://mirrors.aliyun.com/ubuntu/
* zentao
    * ubuntu
    * zentao 8.3.1
* node
    * base
    * yarn
    * Mirror https://registry.npm.taobao.org
* caddy
    * base
    * full
        * With all plugins
    * dns
        * full
        * DNS
    * php
        * php7-fpm
* builder
    * devtools for build projects
    * docker
    * gcc
    * python
    * node
    * golang
    * java
    * maven
* pdns
    * PowerDNS
    * backend mysql,sqlite,pgsql
    * PowerDNS Recursor
* autossh
* [ ] shadowsocks
    * manager
