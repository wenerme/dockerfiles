FROM wener/node:18

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY rootfs /
RUN mkdir -p /app && chown -R nodejs:nodejs /app
WORKDIR /app

# install if packages.json exists
RUN test ! -f packages.json || { npm i && npm cache clean --force }

RUN --mount=type=cache,target=/root/.npm/ \
    npm add -g pg --platform=linuxmusl

USER nodejs

#

COPY --chown=nodejs:nodejs app /app

CMD [ "node" , "--enable-source-maps", "main.mjs" ]
