# Debian


```bash
# Mirror
DISTRIB_CODENAME=$(sed -nr 's/VERSION.*\((.*)\).*/\1/p' /etc/os-release)
echo "# Use Aliyun ubuntu mirror
deb http://mirrors.aliyun.com/debian/               $DISTRIB_CODENAME main non-free contrib
deb http://mirrors.aliyun.com/debian/               $DISTRIB_CODENAME-proposed-updates main non-free contrib
deb-src http://mirrors.aliyun.com/debian/           $DISTRIB_CODENAME main non-free contrib
deb-src http://mirrors.aliyun.com/debian/           $DISTRIB_CODENAME-proposed-updates main non-free contrib
deb http://mirrors.aliyun.com/debian-security/      $DISTRIB_CODENAME/updates main non-free contrib
deb-src http://mirrors.aliyun.com/debian-security/  $DISTRIB_CODENAME/updates main non-free contrib
" > /etc/apt/sources.list
```
