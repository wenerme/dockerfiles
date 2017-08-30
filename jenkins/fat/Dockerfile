FROM wener/jenkins
MAINTAINER wener<wener AT wener.me>

# 安装常用的插件 https://plugins.jenkins.io/
RUN install-plugins.sh \
    nexus-jenkins-plugin nexus-artifact-uploader \
    # Admin \
    ssh-slaves workflow-aggregator copy-to-slave \
    html5-notifier-plugin piwikanalytics \
    ldap matrix-auth role-strategy ldapemail authorize-project \
    saferestart \
    # SCM \
    git git-changelog gitea workflow-multibranch git-parameter \
    # Build triggers \
    rundeck jira-trigger gogs-webhook \
    # Build wrappers \
    credentials-binding build-timeout timestamper \
    # Build notifier \
    email-ext \
    # Deployment plugins \
    docker-workflow \
    # Build tool \
    ant maven-plugin gradle groovy publish-over-ssh job-dsl docker \
    # Build report \
    junit checkstyle warnings findbugs tasks disk-usage \
    # UI \
    blueocean cloudbees-folder translation nested-view

USER root
RUN echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/main/ > /etc/apk/repositories; \
    echo http://mirrors.aliyun.com/alpine/v$(head -c3 /etc/alpine-release)/community/ >> /etc/apk/repositories
RUN apk add --no-cache maven docker
# Works for -v /var/run/docker.sock:/var/run/docker.sock
# RUN adduser jenkins users && adduser jenkins ping
USER jenkins
