#!/bin/sh
# pgsodium / supabase_vault getkey script.
#
# Prints the 32-byte server root key as 64 hex chars on stdout. The key is
# generated on first use and stored as pgsodium_root.key in the data directory.
#
# The postmaster runs this via popen() while loading shared_preload_libraries,
# after it has chdir'd into the data directory, so the current directory is
# the real data directory even when $PGDATA is unset or differs (pg_ctl -D,
# pg_upgrade). Use it first and fall back to $PGDATA.
#
# The key must stay with the data directory. If it is lost or replaced, data
# encrypted by pgsodium / vault cannot be decrypted. It is not included in
# pg_dump; back it up together with the data directory.
set -eu
umask 077

if [ -f PG_VERSION ]; then
  DATA_DIR=$(pwd)
elif [ -n "${PGDATA:-}" ] && [ -f "$PGDATA/PG_VERSION" ]; then
  DATA_DIR=$PGDATA
else
  echo "pgsodium_getkey: cannot locate the data directory (cwd=$(pwd), PGDATA=${PGDATA:-})" >&2
  exit 1
fi

KEY_FILE="$DATA_DIR/pgsodium_root.key"

if [ ! -e "$KEY_FILE" ]; then
  # Write to a temp file and rename, so a crash never leaves a partial key.
  TMP_FILE="$KEY_FILE.tmp.$$"
  head -c 32 /dev/urandom | od -A n -t x1 | tr -d ' \n' > "$TMP_FILE"
  chmod 600 "$TMP_FILE"
  mv "$TMP_FILE" "$KEY_FILE"
fi

KEY=$(cat "$KEY_FILE")
# Never regenerate an existing key: a bad key file needs a human, not a new key.
case "$KEY" in
  *[!0-9a-f]*)
    echo "pgsodium_getkey: $KEY_FILE is not a hex key; refusing to start" >&2
    exit 1
    ;;
esac
if [ "${#KEY}" -ne 64 ]; then
  echo "pgsodium_getkey: $KEY_FILE should be 64 hex chars, got ${#KEY}; refusing to start" >&2
  exit 1
fi

printf '%s\n' "$KEY"
