FROM wener/node:v16
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir -p /app && chown -R nextjs:nodejs /app

COPY rootfs /

RUN --mount=type=cache,target=/root/.npm/ \
    npm add -g sharp pg --platform=linuxmusl
ENV NEXT_SHARP_PATH=/usr/local/lib/node_modules/sharp
USER nextjs

COPY public ./public
COPY next.config.js ./
COPY package.json ./

COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static .next/static

CMD ["node", "server.js"]
