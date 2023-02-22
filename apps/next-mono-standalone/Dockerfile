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

ARG APP_NAME
ENV APP_NAME $APP_NAME
ARG DIR_NAME

COPY next.config.mjs ./apps/${DIR_NAME}/
COPY public ./apps/${DIR_NAME}/public
COPY package.json ./apps/${DIR_NAME}/package.json

COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./apps/${DIR_NAME}/.next/static

WORKDIR /app/apps/${DIR_NAME}

ENV PORT 3000
EXPOSE 3000

# monorepo
CMD ["node", "server.js"]
