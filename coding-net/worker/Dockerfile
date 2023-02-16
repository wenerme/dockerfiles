FROM wener/java:8-builder

RUN apk add --no-cache git make python3 && mkdir -p /root/codingci/tools
WORKDIR /root/codingci/tools

RUN curl -fL  "https://coding-public-generic.pkg.coding.net/cci/release/cci-agent/jenkins.war?version=2.293-cci" -o jenkins.war \
    && curl -fL  "https://coding-public-generic.pkg.coding.net/cci/release/jenkinsHome.zip?version=latest" -o jenkins_home.zip \
    && unzip jenkins_home.zip \
    && rm jenkins_home.zip
