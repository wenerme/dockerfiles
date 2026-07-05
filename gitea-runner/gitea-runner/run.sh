#!/usr/bin/env bash
set -euo pipefail

if [[ ! -d /data ]]; then
  mkdir -p /data
fi

cd /data

RUNNER_STATE_FILE=${RUNNER_STATE_FILE:-'.runner'}

CONFIG_ARG=""
if [[ -n "${CONFIG_FILE:-}" ]]; then
  CONFIG_ARG="--config ${CONFIG_FILE}"
fi

EXTRA_ARGS=""
if [[ -n "${GITEA_RUNNER_LABELS:-}" ]]; then
  EXTRA_ARGS="${EXTRA_ARGS} --labels ${GITEA_RUNNER_LABELS}"
fi
if [[ -n "${GITEA_RUNNER_EPHEMERAL:-}" ]]; then
  EXTRA_ARGS="${EXTRA_ARGS} --ephemeral"
fi

RUN_ARGS=""
if [[ -n "${GITEA_RUNNER_ONCE:-}" ]]; then
  RUN_ARGS="${RUN_ARGS} --once"
fi

if [[ -z "${GITEA_RUNNER_REGISTRATION_TOKEN:-}" && -n "${GITEA_RUNNER_REGISTRATION_TOKEN_FILE:-}" && -f "${GITEA_RUNNER_REGISTRATION_TOKEN_FILE}" ]]; then
  GITEA_RUNNER_REGISTRATION_TOKEN=$(cat "${GITEA_RUNNER_REGISTRATION_TOKEN_FILE}")
fi

if [[ ! -f "$RUNNER_STATE_FILE" ]]; then
  echo "$RUNNER_STATE_FILE is missing or not a regular file"
fi

if [[ ! -s "$RUNNER_STATE_FILE" ]]; then
  try=0
  success=0
  while [[ $success -eq 0 && $try -lt ${GITEA_MAX_REG_ATTEMPTS:-10} ]]; do
    try=$((try + 1))
    act_runner register \
      --instance "${GITEA_INSTANCE_URL}" \
      --token "${GITEA_RUNNER_REGISTRATION_TOKEN}" \
      --name "${GITEA_RUNNER_NAME:-$(hostname)}" \
      ${CONFIG_ARG} ${EXTRA_ARGS} --no-interactive 2>&1 | tee /tmp/reg.log

    if grep -q 'Runner registered successfully' /tmp/reg.log; then
      echo "SUCCESS"
      success=1
    else
      echo "Waiting to retry ..."
      sleep 5
    fi
  done
fi

unset GITEA_RUNNER_REGISTRATION_TOKEN
unset GITEA_RUNNER_REGISTRATION_TOKEN_FILE

exec act_runner daemon ${CONFIG_ARG} ${RUN_ARGS}
