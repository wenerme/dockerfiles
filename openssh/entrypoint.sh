#!/bin/sh
set -e

[ -f /etc/ssh/ssh_host_rsa_key ] || {
    ssh-keygen -t rsa -f /etc/ssh/ssh_host_rsa_key -N '' > /dev/null
    PASSWORD=${PASSWORD:-$(cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 6)}
    USERNAME=root
    echo "$USERNAME:$PASSWORD" | chpasswd
    echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config
    echo "OpenSSH in Docker
User: $USERNAME
Pass: $PASSWORD
"
}

/usr/sbin/sshd -D -h /etc/ssh/ssh_host_rsa_key $*
