set -eo pipefail
export BUILDKIT_PROGRESS=plain

TMPDIR=/tmp/run/$GITHUB_RUN_ID/tmp
mkdir -p $TMPDIR
launch-as() {
  local name=$1
  shift
  echo "[$name] Running"
  (time $@ || echo $name >> $TMPDIR/run.fail.txt) 2>&1 > $TMPDIR/run.$name.txt
  echo "[$name] Done"
}

echo Message:
echo "${{github.event.head_commit.message}}" | sed -e "s/^/  /m"

echo Changes:
# 空格分割
echo ${{ steps.changes.outputs.files }} > $TMPDIR/changes
cat $TMPDIR/changes | sed -e "s/^/  /m"

is-unchanged() {
  # manual
  echo "${{github.event.head_commit.message}}" | grep 'rebuild' && return 1
  # always change
  grep -q pnpm-lock.yaml $TMPDIR/changes && return 1
  # based on message - gitea 不支持
  test "${{github.event.head_commit.message}}" == *"$1"* && return 1
  # based on changed file
  ! grep -q "$1" $TMPDIR/changes
  return $?
}

wait < <(jobs -p)

if [ -f $TMPDIR/run.fail.txt ]; then
  echo Failed:
  cat $TMPDIR/run.fail.txt | sed -e "s/^/  /m"
  exit 1
fi
