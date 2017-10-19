FROM       debian
MAINTAINER wener

RUN DISTRIB_CODENAME=$(sed -nr 's/VERSION.*\((.*)\).*/\1/p' /etc/os-release) && \
    echo "# Use Aliyun ubuntu mirror                                                                            \n\
deb http://mirrors.aliyun.com/debian/               $DISTRIB_CODENAME main non-free contrib                     \n\
deb http://mirrors.aliyun.com/debian/               $DISTRIB_CODENAME-proposed-updates main non-free contrib    \n\
deb-src http://mirrors.aliyun.com/debian/           $DISTRIB_CODENAME main non-free contrib                     \n\
deb-src http://mirrors.aliyun.com/debian/           $DISTRIB_CODENAME-proposed-updates main non-free contrib    \n\
deb http://mirrors.aliyun.com/debian-security/      $DISTRIB_CODENAME/updates main non-free contrib             \n\
deb-src http://mirrors.aliyun.com/debian-security/  $DISTRIB_CODENAME/updates main non-free contrib             \n\
" > /etc/apt/sources.list
