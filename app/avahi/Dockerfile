FROM wener/app

RUN apk add --no-cache dbus dbus-openrc avahi avahi-tools \
  && rc-update add dbus \
  && rc-update add avahi-daemon

