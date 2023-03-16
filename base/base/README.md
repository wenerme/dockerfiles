# Alpine Base Image

- build from rootfs
- using chinese mirror
- add useful tools
  - bash - 1.7 MB
    - treat yourself better
  - curl - check network
  - busybox-extras - 112 kB
    - like telnet for network check
    - arch, dnsd, fakeidentd, ftpd, ftpget, ftpput, httpd, inetd, readahead, telnet, telnetd, tftp, tftpd, udhcpd
  - file - check file, device, block
  - nano - easy editing
  - libc6-compat - glibc compat layer for common use

<!-- lang:zh -->

# Alpine 基础镜像

- 从 rootfs 构建
- 使用中国镜像
  - 默认 aliyun
- 添加实用工具
  - bash - 1.7 MB
  - curl - 网络诊断
  - busybox-extras - 112 kB
    - 包含 telnet 方便诊断
    - arch, dnsd, fakeidentd, ftpd, ftpget, ftpput, httpd, inetd, readahead, telnet, telnetd, tftp, tftpd, udhcpd
  - file - 检测文件、设备、块等
  - nano - 简化编辑
  - libc6-compat,gcompat - glibc 兼容

```bash
# Build a specified version
docker build -t wener/base:3.12 base --build-arg ALPINE_VERSION=3.12
```

```bash
mkdir -p /rootfs && cd /rootfs
apk -X https://mirrors.sjtug.sjtu.edu.cn/alpine/v3.17/main --allow-untrusted --root /rootfs --initdb add alpine-base

echo https://mirrors.sjtug.sjtu.edu.cn/alpine/v3.17/main > /rootfs/etc/apk/repositories
echo https://mirrors.sjtug.sjtu.edu.cn/alpine/v3.17/community >> /rootfs/etc/apk/repositories
apk add --root /rootfs --no-cache -U curl busybox-extras file nano libc6-compat gcompat bash
```
