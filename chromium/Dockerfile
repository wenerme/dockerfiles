FROM wener/xvfb

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

RUN addgroup -S app && adduser -S -G app app \
    && mkdir -p /home/app/Downloads /opt/app \
    && chown -R app:app /home/app \
    && chown -R app:app /opt/app \

USER app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
