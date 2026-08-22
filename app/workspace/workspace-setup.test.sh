#!/bin/sh
set -eu

admin_home="$(getent passwd admin | cut -d: -f6)"
test -n "${admin_home}"
admin_password="$(getent shadow admin | cut -d: -f2)"
admin_shell="$(getent passwd admin | cut -d: -f7)"
backup="$(mktemp -d)"
ssh_backup="$(mktemp -d)"
host_key_sentinel="$(mktemp)"
fake_bin="$(mktemp -d)"
rsync_log="$(mktemp)"
export WORKSPACE_SETUP_RSYNC_LOG="${rsync_log}"
chmod 0666 "${rsync_log}"

restore_home() {
  usermod -p "${admin_password}" -s "${admin_shell}" admin
  rm -rf "${admin_home}"
  install -d -m 0755 -o admin -g admin "${admin_home}"
  cp -a "${backup}/." "${admin_home}/"
  rm -rf /etc/ssh
  install -d -m 0755 /etc/ssh
  cp -a "${ssh_backup}/." /etc/ssh/
  rm -rf "${backup}" "${ssh_backup}" "${fake_bin}" "${rsync_log}" "${host_key_sentinel}"
}
trap restore_home EXIT

if [ -d "${admin_home}" ]; then
  cp -a "${admin_home}/." "${backup}/"
fi
cp -a /etc/ssh/. "${ssh_backup}/"

rm -rf "${admin_home}"
install -d -m 0755 -o admin -g admin "${admin_home}"
ln -s /etc "${admin_home}/.ssh"
if /usr/local/sbin/workspace-setup >/dev/null 2>&1; then
  echo 'workspace-setup accepted a symlinked .ssh directory' >&2
  exit 1
fi

rm -f "${admin_home}/.ssh"
install -d -m 0700 -o admin -g admin "${admin_home}/.ssh"
ln -s /etc/passwd "${admin_home}/.ssh/authorized_keys"
if /usr/local/sbin/workspace-setup >/dev/null 2>&1; then
  echo 'workspace-setup accepted a symlinked authorized_keys file' >&2
  exit 1
fi

rm -f "${admin_home}/.ssh/authorized_keys"
su-exec admin touch "${admin_home}/.ssh/authorized_keys"
chmod 0644 "${admin_home}/.ssh/authorized_keys"
rm -f \
  "${admin_home}/.bashrc" \
  "${admin_home}/.inputrc" \
  "${admin_home}/.profile"

rm -rf /etc/ssh
ln -s /tmp /etc/ssh
if /usr/local/sbin/workspace-setup >/dev/null 2>&1; then
  echo 'workspace-setup accepted a symlinked /etc/ssh directory' >&2
  exit 1
fi

rm /etc/ssh
install -d -m 0755 /etc/ssh
cp -a "${ssh_backup}/." /etc/ssh/
printf '%s\n' 'workspace-host-key-sentinel' > "${host_key_sentinel}"
ln -s "${host_key_sentinel}" /etc/ssh/ssh_host_ed25519_key
if /usr/local/sbin/workspace-setup >/dev/null 2>&1; then
  echo 'workspace-setup accepted a symlinked SSH host key' >&2
  exit 1
fi
test "$(cat "${host_key_sentinel}")" = workspace-host-key-sentinel
rm /etc/ssh/ssh_host_ed25519_key

cat > "${fake_bin}/install" <<'EOF'
#!/bin/sh
for arg in "$@"; do
  case "${arg}" in
    -o|-g|--owner|--owner=*|--group|--group=*)
      echo 'install owner/group mutation rejected by root-squash test' >&2
      exit 96
      ;;
  esac
done
exec /usr/bin/install "$@"
EOF

cat > "${fake_bin}/chown" <<'EOF'
#!/bin/sh
echo 'chown rejected by root-squash test' >&2
exit 97
EOF

cat > "${fake_bin}/rsync" <<'EOF'
#!/bin/sh
has_no_owner=false
has_no_group=false

for arg in "$@"; do
  case "${arg}" in
    --no-owner) has_no_owner=true ;;
    --no-group) has_no_group=true ;;
    --chown|--chown=*)
      echo 'rsync --chown rejected by root-squash test' >&2
      exit 98
      ;;
  esac
done

if [ "${has_no_owner}" != true ] || [ "${has_no_group}" != true ]; then
  echo 'rsync must disable owner and group preservation' >&2
  exit 99
fi

printf '%s\n' "$*" >> "${WORKSPACE_SETUP_RSYNC_LOG}"
exec /usr/bin/rsync "$@"
EOF

chmod 0755 "${fake_bin}"
chmod 0755 "${fake_bin}/install" "${fake_bin}/chown" "${fake_bin}/rsync"
PATH="${fake_bin}:${PATH}" /usr/local/sbin/workspace-setup

test "$(id -u admin)" = 1000
test "$(wc -l < "${rsync_log}")" = 2
test "$(stat -c %u "${admin_home}")" = 1000
test "$(stat -c %u "${admin_home}/.ssh")" = 1000
test "$(stat -c %a "${admin_home}/.ssh")" = 700
test "$(stat -c %u "${admin_home}/.ssh/authorized_keys")" = 1000
test "$(stat -c %a "${admin_home}/.ssh/authorized_keys")" = 600
