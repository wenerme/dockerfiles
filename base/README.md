## Supported Tags

- base
- bash
- openrc
- app

# Alpine Base Image

- build from rootfs
- using chinese mirror
- add useful tools
  - curl - check network
  - busybox-extras - 112 kB
    - like telnet for network check
    - arch, dnsd, fakeidentd, ftpd, ftpget, ftpput, httpd, inetd, readahead, telnet, telnetd, tftp, tftpd, udhcpd
  - file - check file, device, block
  - nano - easy editing
  - libc6-compat - glibc compat layer for common use

## base:bash

Use bash as default shell

## wener/base:openrc

Running openrc in docker.

## wener/base:openrc

Running openrc in docker, by default enabled local and syslog service, create admin account with disabled password.

# Alpine 基础镜像

- 从 rootfs 构建
- 使用中国镜像
- 添加实用工具
  - curl - 网络诊断
  - busybox-extras - 112 kB
    - 包含 telnet 方便诊断
    - arch, dnsd, fakeidentd, ftpd, ftpget, ftpput, httpd, inetd, readahead, telnet, telnetd, tftp, tftpd, udhcpd
  - file - 检测文件、设备、块等
  - nano - 简化编辑
  - libc6-compat - glibc 兼容

## base:bash

使用 bash 作为默认 shell。

## wener/base:openrc

在 Docker 中运行 openrc 服务.

## wener/base:openrc

在 Docker 中运行 openrc 服务, 默认启用了 syslog 和 local 服务。创建了 admin 账号，但禁用了密码

- syslog
  - 用于服务日志记录 - 例如 ssh
- local
  - 用于启动本地脚本
