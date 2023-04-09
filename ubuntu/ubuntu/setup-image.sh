. /etc/os-release && \
echo "# Use Aliyun ubuntu mirror
deb http://mirrors.aliyun.com/ubuntu/ $VERSION_CODENAME main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ $VERSION_CODENAME-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ $VERSION_CODENAME-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ $VERSION_CODENAME-proposed main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ $VERSION_CODENAME-backports main restricted universe multiverse
# deb-src http://mirrors.aliyun.com/ubuntu/ $VERSION_CODENAME main restricted universe multiverse
# deb-src http://mirrors.aliyun.com/ubuntu/ $VERSION_CODENAME-security main restricted universe multiverse
# deb-src http://mirrors.aliyun.com/ubuntu/ $VERSION_CODENAME-updates main restricted universe multiverse
# deb-src http://mirrors.aliyun.com/ubuntu/ $VERSION_CODENAME-proposed main restricted universe multiverse
# deb-src http://mirrors.aliyun.com/ubuntu/ $VERSION_CODENAME-backports main restricted universe multiverse" \
| tee /etc/apt/sources.list > /dev/null

apt update
apt upgrade -y
apt install -y \
  apt-transport-https \
  ca-certificates

sed -i 's/http:/https:/' /etc/apt/sources.list

apt install -y \
  curl \
  nano \
  file

#sed -i 's/^# deb-src/deb-src/' /etc/apt/sources.list

rm -rf /var/lib/apt/lists/*
rm -f /setup-image.sh
