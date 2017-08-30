FROM jenkins:alpine
MAINTAINER wener<wener AT wener.me>

# 清华大学镜像没有插件
# ENV JENKINS_UC https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates

# 安装常用的插件 https://plugins.jenkins.io/
RUN install-plugins.sh \
    blueocean ldap git docker

