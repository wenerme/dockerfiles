FROM wener/node:18

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY rootfs /
RUN mkdir -p /app && chown -R nodejs:nodejs /app
WORKDIR /app

# install if packages.json exists
RUN test ! -f packages.json || npm i

RUN --mount=type=cache,target=/root/.npm/ \
    npm add -g sharp pg --platform=linuxmusl
ENV NEXT_SHARP_PATH=/usr/local/lib/node_modules/sharp
USER nodejs

#

COPY public ./public
COPY next.config.mjs ./
COPY package.json ./

COPY --chown=nodejs:nodejs .next/standalone ./
COPY --chown=nodejs:nodejs .next/static .next/static

CMD ["node", "server.js"]
