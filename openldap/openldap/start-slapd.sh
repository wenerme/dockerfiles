#!/bin/sh

: "${LDAP_DEBUG_LEVEL:=0}"
: "${LDAP_URIS:="ldap:// ldaps:// ldapi://"}"

if [ -z "$SLAPD_CONF" ]; then

exec /usr/sbin/slapd \
  -u ldap -g ldap \
	-d ${LDAP_DEBUG_LEVEL} \
	-h "${LDAP_URIS}" \
	${LDAP_EXTRA_ARGS}

else

exec /usr/sbin/slapd \
  -u ldap -g ldap \
  -f "$SLAPD_CONF" \
	-d ${LDAP_DEBUG_LEVEL} \
	-h "${LDAP_URIS}" \
	${LDAP_EXTRA_ARGS}

fi
