# Dockerfiles

很多常用的镜像,与其他相同的镜像相比有如下特点

* 使用国内镜像
    * ubuntu
    * alpine
* 尽可能的使用 alpine 作为基础镜像

## 镜像列表
* base
    * alpine:3.4
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
