# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333
ENV TS_NODE_TRANSPILE_ONLY=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3333
CMD ["node", "--loader", "ts-node-maintained/esm", "bin/server.ts"]
