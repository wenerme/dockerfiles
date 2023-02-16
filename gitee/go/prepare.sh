#!/bin/bash
set -e

function get_json_value() {
        local json=$1
        local key=$2

        if [[ -z "$3" ]]; then
        local num=1
        else
        local num=$3
        fi
        local value=$(echo "${json}" | awk -F"[,:}]" '{for(i=1;i<=NF;i++){if($i~/'${key}'\042/){print $(i+1)}}}' | tr -d '"' | sed -n ${num}p)
        echo ${value}
}

WORK_DIR=$(pwd)
if [[ $WORK_DIR == "/" ]]; then
        WORK_DIR=''
fi
SERVER="https://server-agent.gitee.com/gitee_sa_server"
INSTALL_DIR=${WORK_DIR}/gitee_go_agent
FILE_DOWNLOAD_URI="https://gitee-agent-shell.gz.bcebos.com"
JDK_DOWNLOAD_PATH="/agent/jdk-8u251-linux-x64.tar.gz"
AGENT_DOWNLOAD_PATH="/agent/agent.jar"
UUID_AUTH_URL=''
JAVA=java
JDK_DIR="${INSTALL_DIR}/jdk4agent"
UUID_AUTH_URL_PATH='/sa/rest/v2/agents'
REMARK=''
EXECUTOR_COUNT=''
LABEL_TYPE=''

PRXOY_DOWNLOAD_PATH="/proxy/gitee-proxy"
MAX_PROXY_COUNT=''

mkdir -p ${INSTALL_DIR}
if [[ ! -d "${INSTALL_DIR}" ]]; then
  echo "install dir [${INSTALL_DIR}] not exit"
  exit 1
fi

ARGS=`getopt -o s:u:a:j:r:c:p:l: -l server:,uuid-url:,agent-url:,jdk-url:,install-dir: -n 'agent_install.sh' -- "$@"`

echo $ARGS

#将规范化后的命令行参数分配至位置参数（$1,$2,...)
eval set -- "${ARGS}"

while true; do
        case "$1" in
        -s | --server)
                case "$2" in
                "")
                        echo "server must be specified!"
                        exit 1
                        ;;
                *)
                        SERVER=$2
                        shift 2
                        ;;
                esac
                ;;
        -u | --uuid-url)
                case "$2" in
                "")
                        echo "uuid-url must be specified!"
                        exit 1
                        ;;
                *)
                        UUID_AUTH_URL=$2
                        shift 2
                        ;;
                esac
                ;;
        -r | --remark)
                case "$2" in
                "")
                        shift 2
                        ;;
                *)
                        REMARK=$2
                        shift 2
                        ;;
                esac
                ;;
        -c | --count)
                case "$2" in
                "")
                        shift 2
                        ;;
                *)
                        EXECUTOR_COUNT=$2
                        shift 2
                        ;;
                esac
                ;;
        -p | --proxy)
                case "$3" in
                "")
                        shift 2
                        ;;
                *)
                        MAX_PROXY_COUNT=$2
                        shift 2
                        ;;
                esac
                ;;
        -l | --label)
                case "$2" in
                "")
                        shift 2
                        ;;
                *)
                        LABEL_TYPE=$2
                        shift 2
                        ;;
                esac
                ;;
        --install-dir)
                case "$2" in
                "")
                        INSTALL_DIR='.'
                        shift 2
                        ;;
                *)
                        INSTALL_DIR=$2
                        shift 2
                        ;;
                esac
                ;;
        --)
                shift
                break
                ;;
        *)
                echo "Invalid params!"
                exit 1
                ;;
        esac
done


command_exists() {
        command -v "$@" > /dev/null 2>&1
}

function is_empty() {
        echo "$2: $1"
        if test -z $1; then
                echo "ERROR: $2 is blank"
                exit 1
        fi
}

function check_curl() {
        # 检查curl是否安装
        if command_exists curl; then
                echo "[curl] found, ok"
        else
                echo "[curl] not found, please install it!"
                exit 1
        fi
}

function check_monitor() {
        SERVER_MONITOR_URL=${SERVER}/monitor/ok
        # 检查机器与服务端是否互通
        set -x
        response=$(curl -m 30 -o /dev/null -s -w "%{http_code}" ${SERVER_MONITOR_URL})
        set +x
        if [[ "${response}" == "200" ]] || [[ "${response}" == "301" ]] || [[ "${response}" == "000" ]]; then
                echo "access server success"
        else
                echo "can not access server, please check network"
                exit 1
        fi
}

# 安装Jdk
function install_jdk() {
        cd ${JDK_DIR}
        pwd
        if [[ $LABEL_TYPE == "LAN" ]]; then
                JDK_DOWNLOAD_URL="${SERVER}${JDK_DOWNLOAD_PATH}"
        else
                JDK_DOWNLOAD_URL="${FILE_DOWNLOAD_URI}${JDK_DOWNLOAD_PATH}"
        fi
        echo "-------downloading jdk-------"
        curl -m 300 -H "Redirect-Uri:${FILE_DOWNLOAD_URI}" "${JDK_DOWNLOAD_URL}" -o - | tar -zxf - --no-same-owner
        JAVA=${JDK_DIR}/jdk1.8.0_251/bin/java
        echo "-------jdk download success-------"
}

function check_jdk() {
        mkdir -p ${JDK_DIR}
        # 检查java版本是否大于等于1.6
        export PATH=${JDK_DIR}/jdk1.8.0_251/bin:${PATH}
        if command_exists java; then
                java_version=$(java -version 2>&1 | awk 'NR==1{gsub(/"/,"");print $3}')
                echo "java version: ${java_version}"

                second_bit_version=$(echo ${java_version} | awk -F '.' '{print $2}')
                if [[ ${second_bit_version} -lt 6 ]]; then
                        # 重新安装jdk
                        install_jdk
                fi

        else
                # 不存在则安装
                install_jdk
        fi
        ${JAVA} -version
}

function agent_download() {
        # 下载 agent.jar
        cd ${INSTALL_DIR}
        if test -f agent.jar; then
             rm -rf agent.jar
        fi
        if [[ $LABEL_TYPE == "LAN" ]]; then
                AGENT_DOWNLOAD_URL="${SERVER}${AGENT_DOWNLOAD_PATH}"
        else
                AGENT_DOWNLOAD_URL="${FILE_DOWNLOAD_URI}${AGENT_DOWNLOAD_PATH}"
        fi
        echo "-------downloading agent-------"
        curl -m 180 -H "Redirect-Uri:${FILE_DOWNLOAD_URI}" "${AGENT_DOWNLOAD_URL}" -O
        echo "-------agent download success-------"
}

function proxy_download() {
        # 下载 proxy
        cd ${INSTALL_DIR}
        if test -f gitee-proxy; then
             rm -rf gitee-proxy
        fi
        echo "-------downloading proxy-------"
        curl -m 60 -O "${FILE_DOWNLOAD_URI}${PRXOY_DOWNLOAD_PATH}"
        echo "-------proxy download success-------"  
}


function agent_launch() {
        # 启动 agent
        if test -f run.log; then
                rm run.log
        fi
        u_token=$1
        is_lanuch=$2
        echo "--------------START AGENT--------------"
        ps_out=`ps -ef | grep 'agent.jar' | grep -v 'grep' | wc -l`
        if [[ $is_lanuch -eq 1 || $ps_out -eq 0  ]]; then
                echo "Agent Not Running Or Need To Lanuch"
                set -x
                nohup ${JAVA} -jar -Dfile.encoding=UTF-8 agent.jar -s ${SERVER} -t ${u_token} >>run.log 2>&1 &
                set +x
                # 输出启动结果
                sleep 10
                cat run.log
        else
                echo "Agent Running No Need To Launch"
        fi
}


function proxy_launch() {
        # 启动 proxy
        if test -f run.log; then
              rm run.log
        fi
        echo "--------------START PROXY--------------"
        ps_out=`ps -ef | grep 'gitee-proxy' | grep -v 'grep' | wc -l`
        if [[ $ps_out -eq 0 ]]; then       
                chmod +x -R gitee-proxy
                set -x
                nohup ./gitee-proxy -s ${SERVER} -t ${u_token} >>run.log 2>&1 &
                set +x
        else
                echo "Proxy Running No Need To Lanuch"
        fi
}

# 检查参数
echo "--------------PARAMS CHECK--------------"
is_empty "${FILE_DOWNLOAD_URI}" "file download uri"
is_empty "${JDK_DOWNLOAD_PATH}" "jdk download path"
is_empty "${AGENT_DOWNLOAD_PATH}" "agent download path"
is_empty "${PRXOY_DOWNLOAD_PATH}" "proxy download path"
is_empty "${UUID_AUTH_URL}" "uuid url"
is_empty "${SERVER}" "server"
is_empty "${INSTALL_DIR}" "install-dir"

echo "--------------PREPARE ENV--------------"

proxy_download

check_jdk
agent_download
