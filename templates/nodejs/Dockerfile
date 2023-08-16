FROM wener/node:18

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NUXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN mkdir -p /app && chown -R nodejs:nodejs /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm/ \
    npm install
COPY . .

RUN npm run build

USER nodejs
CMD ["npm", "start"]
