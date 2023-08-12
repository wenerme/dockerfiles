ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

# https://github.com/dockage/alpine/blob/master/3.10/openrc/Dockerfile
RUN apk add --no-cache openrc su-exec ca-certificates wait4ports \
    # Disable getty's
    && sed -i 's/^\(tty\d\:\:\)/#\1/g' /etc/inittab \
    && mkdir /etc/rc.conf.d \
    # Change subsystem type to "docker"
    && echo 'rc_sys="docker"' >> /etc/rc.conf.d/docker.conf \
    # Allow all variables through
    && echo 'rc_env_allow="*"' >> /etc/rc.conf.d/docker.conf \
    # Start crashed services
    && echo 'rc_crashed_stop=NO' >> /etc/rc.conf.d/docker.conf \
    && echo 'rc_crashed_start=YES' >> /etc/rc.conf.d/docker.conf \
    # Define extra dependencies for services
    # - docker provide network
    # - docker control the hostname unless add cap SYS_ADMIN
    && echo 'rc_provide="loopback net hostname"' >> /etc/rc.conf.d/docker.conf \
    # Verbose rc log for debugging
    # && echo 'rc_verbose=yes' >> /etc/rc.conf.d/docker.conf \
    # Remove unnecessary services
    && rm -f /etc/init.d/hwdrivers \
            /etc/init.d/hwclock \
            /etc/init.d/hwdrivers \
            /etc/init.d/modules \
            /etc/init.d/modules-load \
            /etc/init.d/modloop \
    # Can't do cgroups
    && sed -i 's/\tcgroup_add_service/\t#cgroup_add_service/g' /lib/rc/sh/openrc-run.sh \
    && sed -i 's/VSERVER/DOCKER/Ig' /lib/rc/sh/init.sh

CMD ["/sbin/init"]
