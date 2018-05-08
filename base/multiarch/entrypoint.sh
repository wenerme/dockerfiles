#!/bin/bash
set -e

qemu_target_list="i386 i486 alpha arm armeb sparc32plus ppc ppc64 ppc64le m68k \
mips mipsel mipsn32 mipsn32el mips64 mips64el \
sh4 sh4eb s390x aarch64 aarch64_be hppa riscv32 riscv64 xtensa xtensaeb microblaze microblazeel"

qemu_check_access() {
    if [ ! -w "$1" ] ; then
        echo "ERROR: cannot write to $1" 1>&2
        exit 1
    fi
}

qemu_check_bintfmt_misc() {
    # load the binfmt_misc module
    if [ ! -d /proc/sys/fs/binfmt_misc ]; then
      if ! /sbin/modprobe binfmt_misc ; then
          exit 1
      fi
    fi
    if [ ! -f /proc/sys/fs/binfmt_misc/register ]; then
      if ! mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc ; then
          exit 1
      fi
    fi

    qemu_check_access /proc/sys/fs/binfmt_misc/register
}

register(){
  ./qemu-binfmt-conf.sh --qemu-path /usr/bin
}

unregister(){
  local targets=${@:-$qemu_target_list}
  for i in $targets; do
  if [ -e /proc/sys/fs/binfmt_misc/qemu-$i ]; then
    echo "Un register target \`$i'"
    echo -1 > /proc/sys/fs/binfmt_misc/qemu-$i
  else
    echo "Target \`$i' not registered"
  fi
  done
}

show(){
  local targets=${@:-$qemu_target_list}
  for i in $targets; do
  if [ -e /proc/sys/fs/binfmt_misc/qemu-$i ]; then
    cat /proc/sys/fs/binfmt_misc/qemu-$i
    echo
  fi
  done
}

usage(){
  echo "
Usage: docker run --rm -it --privileged wener/base:multiarch <COMMAND> [args...]

  register    Register binfmt
  unregister  Unregister binfmt
  show        Show registered
  help        Show this help message
"
}

main(){
  [ -z "$VERBOSE" ] || set -o xtrace

  qemu_check_bintfmt_misc

  local action=${1:-help} # 操作
  shift

  case "$action" in
  "register" | "unregister" | "show")
      if [ "$(type -t "${action}")" = function ]; then
          "${action}" "$@"
      else
          echo "Command not found ${action}"
          exit 1
      fi
      ;;
  "help")
      usage
      ;;
  *)
      echo Command not found: ${action}
      usage
      exit 1
      ;;
  esac
}

main "$@"

