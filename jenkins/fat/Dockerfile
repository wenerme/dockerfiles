FROM wener/jenkins
MAINTAINER wener<wener AT wener.me>

# 安装常用的插件 https://plugins.jenkins.io/
RUN install-plugins.sh \
    nexus-jenkins-plugin nexus-artifact-uploader \
    # Admin \
    ssh-slaves workflow-aggregator copy-to-slave \
    html5-notifier-plugin piwikanalytics \
    ldap matrix-auth role-strategy ldapemail authorize-project \
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

