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

## 镜像列表
* base
    * alpine:3.5
    * 镜像: http://mirrors.aliyun.com/alpine
* nginx
    * base
    * nginx-lua
* java
    * base
    * OpenJDK 8
    * Maven 3.3.9
* ubuntu
    * 镜像: http://mirrors.aliyun.com/ubuntu/
* zentao
    * ubuntu
    * zentao 8.3.1
* node
    * node:7-alpine
    * yarn
    * 镜像: https://registry.npm.taobao.org
