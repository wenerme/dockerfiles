#!/bin/bash
set -e

qemu_target_list="i386 i486 alpha arm armeb sparc32plus ppc ppc64 ppc64le m68k \
mips mipsel mipsn32 mipsn32el mips64 mips64el \
sh4 sh4eb s390x aarch64 aarch64_be hppa riscv32 riscv64 xtensa xtensaeb microblaze microblazeel"


qemu_get_family() {
    cpu=${HOST_ARCH:-$(uname -m)}
    case "$cpu" in
    amd64|i386|i486|i586|i686|i86pc|BePC|x86_64)
        echo "i386"
        ;;
    mips*)
        echo "mips"
        ;;
    "Power Macintosh"|ppc64|powerpc|ppc)
        echo "ppc"
        ;;
    ppc64el|ppc64le)
        echo "ppcle"
        ;;
    arm|armel|armhf|arm64|armv[4-9]*l|aarch64)
        echo "arm"
        ;;
    armeb|armv[4-9]*b|aarch64_be)
        echo "armeb"
        ;;
    sparc*)
        echo "sparc"
        ;;
    riscv*)
        echo "riscv"
        ;;
    *)
        echo "$cpu"
        ;;
    esac
}

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

qemu_get_arch() {
local arch=$1
case "$arch" in
    x86)
        echo "i386"
        ;;
    arm|armhf)
        echo "arm"
        ;;
    *)
        echo "$arch"
        ;;
    esac
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

QEMU_ARCH=${QEMU_ARCH:-$(qemu_get_arch $ARCH)}
ROOTDIR=${ROOTDIR:-/target-root}

build-arch(){
  echo "Build target $ARCH with $QEMU_ARCH to $ROOTDIR"
  local root=${ROOTDIR:-/target-root}
  apk add --no-cache qemu-$QEMU_ARCH
  wget -q https://mirrors.tuna.tsinghua.edu.cn/alpine/v$(sed -n 's/\.\d\+$//p' /etc/alpine-release)/releases/$ARCH/alpine-minirootfs-$(cat /etc/alpine-release)-$ARCH.tar.gz
  mkdir -p $ROOTDIR
  tar zxf alpine-minirootfs-$(cat /etc/alpine-release)-$ARCH.tar.gz -C $ROOTDIR
  cp /usr/bin/qemu-$QEMU_ARCH $ROOTDIR/usr/bin
  cp /etc/apk/repositories $ROOTDIR/etc/apk/repositorie
}

main(){
  [ -z "$VERBOSE" ] || set -o xtrace

  qemu_check_bintfmt_misc

  local action=${1:-help} # 操作
  shift

  case "$action" in
  "register" | "unregister" | "show" | "build-arch")
      if [ "$(type -t "${action}")" = function ]; then
          "${action}" "$@"
      else
          echo "Command not found ${action}"
          exit 1
      fi
      ;;
  "sh"|"bash")
        "${action}" "$@"
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

