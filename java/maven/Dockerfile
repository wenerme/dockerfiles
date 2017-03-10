FROM        wener/java
MAINTAINER  wener<wener@wener.me>

# Add maven
ENV MAVEN_VERSION 3.3.9
ENV MAVEN_ALPINE_VERSION 3.3.9-r1
RUN apk add --no-cache maven="$MAVEN_ALPINE_VERSION"

CMD ["mvn"]
