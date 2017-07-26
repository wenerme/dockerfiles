FROM jenkins:alpine
MAINTAINER wener<wener AT wener.me>

# 清华大学镜像没有插件
# ENV JENKINS_UC https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates

# 安装常用的插件 https://plugins.jenkins.io/
RUN install-plugins.sh \
    blueocean ldap git docker

USER root
RUN echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/community/ >> /etc/apk/repositories
RUN apk add --no-cache maven docker
USER jenkins
