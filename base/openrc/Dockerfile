ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

# https://github.com/dockage/alpine/blob/main/3.18/Dockerfile
RUN apk add --no-cache openrc su-exec ca-certificates wait4ports \
    # Disable getty's
    && sed -i 's/^\(tty\d\:\:\)/#\1/g' /etc/inittab \
    && sed -i \
        # Change subsystem type to "docker"
        -e 's/#rc_sys=".*"/rc_sys="docker"/g' \
        # Allow all variables through
        -e 's/#rc_env_allow=".*"/rc_env_allow="\*"/g' \
        # Start crashed services
        -e 's/#rc_crashed_stop=.*/rc_crashed_stop=NO/g' \
        -e 's/#rc_crashed_start=.*/rc_crashed_start=YES/g' \
        # Define extra dependencies for services - maybe hostname ?
        -e 's/#rc_provide=".*"/rc_provide="loopback net"/g' \
        /etc/rc.conf \
    # Remove unnecessary services
    && rm -f /etc/init.d/hwdrivers \
             /etc/init.d/hwclock \
             /etc/init.d/hwdrivers \
             /etc/init.d/modules \
             /etc/init.d/modules-load \
             /etc/init.d/modloop \
    # Can't do cgroups
    && sed -i 's/\tcgroup_add_service/\t#cgroup_add_service/g' /usr/libexec/rc/sh/openrc-run.sh \
    && sed -i 's/VSERVER/DOCKER/Ig' /usr/libexec/rc/sh/init.sh \
    # avoid clean_run
    && sed -i 's/VSERVER/DOCKER/Ig' /etc/init.d/bootmisc

CMD ["/sbin/init"]

# for debug
# echo 'rc_verbose=yes' >> /etc/rc.conf.d/docker.conf
