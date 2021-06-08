# Debian


```bash
# Mirror
cp /etc/apt/sources.list  /etc/apt/sources.list.origin
# VERSION_CODENAME=$(sed -nr 's/VERSION.*\((.*)\).*/\1/p' /etc/os-release)
source /etc/os-release
echo "# Use Aliyun ubuntu mirror
deb http://mirrors.aliyun.com/debian/               $VERSION_CODENAME main non-free contrib
deb http://mirrors.aliyun.com/debian/               $VERSION_CODENAME-proposed-updates main non-free contrib
deb-src http://mirrors.aliyun.com/debian/           $VERSION_CODENAME main non-free contrib
deb-src http://mirrors.aliyun.com/debian/           $VERSION_CODENAME-proposed-updates main non-free contrib
deb http://mirrors.aliyun.com/debian-security/      $VERSION_CODENAME/updates main non-free contrib
deb-src http://mirrors.aliyun.com/debian-security/  $VERSION_CODENAME/updates main non-free contrib
" > /etc/apt/sources.list

echo "deb http://mirrors.aliyun.com/debian $VERSION_CODENAME-backports main" > /etc/apt/sources.list.d/backports.list
```
