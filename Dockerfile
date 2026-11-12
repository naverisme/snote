# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund --prefer-offline
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY . .
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
RUN npm run prisma:generate -w @snote/api && npm run build

FROM node:22-bookworm-slim AS api
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production PORT=3000 STORAGE_ROOT=/data/storage
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/prisma /app/apps/api/prisma
COPY --from=build /app/packages/contracts /app/packages/contracts
RUN mkdir -p /data/storage && chown -R node:node /data/storage
USER node
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]

FROM caddy:2 AS web
COPY --from=build /app/apps/web/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443
