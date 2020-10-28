FROM wener/base

RUN apk add --no-cache -X https://mirrors.aliyun.com/alpine/edge/main ansible \
    # general
    && apk add --no-cache util-linux rsync autossh sshpass git openssh python3 py3-pip \
    # terrraform
    && apk add --no-cache -X https://mirrors.aliyun.com/alpine/edge/community terraform \
    # for docker
    && apk add --no-cache py3-dockerpty \
    # kubernetes
    # && pip3 install --no-cache-dir openshift \
    # pg
    && apk add --no-cache py3-psycopg2 \
    # ops
    && apk add --no-cache py3-gitlab bash-completion \
    # ansible completion
    && apk add --no-cache -X https://mirrors.aliyun.com/alpine/edge/testing py3-argcomplete \
    && mkdir -p /etc/bash_completion.d \
    && activate-global-python-argcomplete
