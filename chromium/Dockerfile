FROM wener/xvfb

# --mount=type=cache,target=/etc/apk/cache
RUN apk add \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      font-noto-cjk \
      chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 因为是安装在 xvfb 里 - 所以不能 nonroot
#RUN addgroup -S app && adduser -S -G app app \
#    && mkdir -p /home/app/Downloads /opt/app \
#    && chown -R app:app /home/app \
#    && chown -R app:app /opt/app \
#
#USER app
# USER admin
