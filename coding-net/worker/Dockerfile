FROM wener/app

ENV LANG C.UTF-8

# java8
RUN { \
		echo '#!/bin/sh'; \
		echo 'set -e'; \
		echo; \
		echo 'dirname "$(dirname "$(readlink -f "$(which javac || which java)")")"'; \
	} > /usr/local/bin/docker-java-home \
	&& chmod +x /usr/local/bin/docker-java-home
ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV PATH $PATH:/usr/lib/jvm/java-1.8-openjdk/jre/bin:/usr/lib/jvm/java-1.8-openjdk/bin

RUN set -x \
	&& apk add --no-cache openjdk8 \
	&& [ "$JAVA_HOME" = "$(docker-java-home)" ]

# maven

# 基础依赖+工具
RUN apk add --no-cache maven git make python3 py3-pip curl unzip gcc python3-dev musl-dev linux-headers go tree

# CI_HOME
#RUN mkdir -p /root/codingci
#WORKDIR /root/codingci

# tools
# install.sh 会删除
#RUN curl -fL  "https://coding-public-generic.pkg.coding.net/cci/release/cci-agent/jenkins.war?version=2.293-cci" -o jenkins.war \
#    && curl -fL  "https://coding-public-generic.pkg.coding.net/cci/release/jenkinsHome.zip?version=latest" -o jenkins_home.zip \
#    && unzip jenkins_home.zip \
#    && rm jenkins_home.zip
