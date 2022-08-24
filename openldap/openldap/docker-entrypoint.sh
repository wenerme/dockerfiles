#!/bin/bash
set -x

# https://github.com/larsks/docker-slapd-example

: "${DOCKER_ENTRYPOINT_DIR:=/docker-entrypoint.d}"
: "${LDAP_LIMIT_FILES:=4096}"
: "${SLAPD_INIT_CONF:=/etc/openldap/slapd.conf.init}"
# $SLAPD_CONF

ulimit -n "${LDAP_LIMIT_FILES}"

install -d -m 700 -o ldap -g ldap /var/lib/openldap/run
chown -R ldap:ldap /var/lib/openldap

if [ -z "$SLAPD_CONF" ]; then
  mkdir /etc/openldap/slapd.d

  [ -e "$SLAPD_INIT_CONF" ] || cat <<-EOF > $SLAPD_INIT_CONF
	pidfile /var/lib/openldap/run/slapd.pid
	database config
	access to * by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth" manage
	EOF

  # Convert the stub slapd.conf into a cn=config directory configuration.
  slaptest -f "$SLAPD_INIT_CONF" -F /etc/openldap/slapd.d

  # Start a temporary slapd instance in the background.
  slapd -h ldapi:///

  ldapadd -c -Y EXTERNAL -H ldapi:// -f /etc/openldap/schema/core.ldif

else

  chown -R ldap:ldap "$SLAPD_CONF"
  slapd -f "$SLAPD_CONF" -h ldapi:///

fi


for initfile in "$DOCKER_ENTRYPOINT_DIR"/*; do
  [ -f "$initfile" ] || continue
  echo "process entry: " $initfile

  rc=0
  case "$initfile" in
  *.sh)
    bash "$initfile"
    rc=$?
    ;;

  *.ldif)
    ldapadd -c -Y EXTERNAL -H ldapi:// -f "$initfile"
    rc=$?
    ;;

  *.schema)
    schemaname="$(cat initfile)"
    ldapadd -c -Y EXTERNAL -H ldapi:// -f "/etc/openldap/schema/$schemaname.ldif"
    rc=$?
    ;;

  *)
    echo "Unsupported extension: $initfile"
    ;;
  esac

  if [ "$rc" = 68 ]; then
    echo "SUCCESS(skip exists): $initfile"
  elif [ "$rc" -ne 0 ]; then
    echo "FAILED(${rc}): $initfile" >&2
    exit 1
  else
    echo "SUCCESS: $initfile"
  fi
done

kill "$(cat /var/lib/openldap/run/slapd.pid)"

if [ -d /etc/openldap/slapd.d ]; then
  chown -R ldap:ldap /etc/openldap/slapd.d /var/lib/openldap
fi

chown -R ldap:ldap /var/lib/openldap

exec "$@"
