FROM        wener/java:maven

ENV IVY_HOME /cache
ENV GRADLE_VERSION 5.3
ENV GRADLE_HOME /usr/local/gradle
ENV PATH ${PATH}:${GRADLE_HOME}/bin

# Install gradle
WORKDIR /usr/local
RUN curl -LOs  https://services.gradle.org/distributions/gradle-$GRADLE_VERSION-bin.zip && \
    unzip gradle-$GRADLE_VERSION-bin.zip && \
    rm -f gradle-$GRADLE_VERSION-bin.zip && \
    ln -s gradle-$GRADLE_VERSION gradle && \
    echo -ne "- with Gradle $GRADLE_VERSION\n" >> /root/.built
