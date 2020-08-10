FROM wener/app

RUN apk add --no-cache util-linux \
  && echo root:root | chpasswd \
  && sed -i -re 's/^(root.*?)ash/\1bash/' /etc/passwd \
  && echo 'console::respawn:/sbin/agetty -L console 115200 vt100' >> /etc/inittab
