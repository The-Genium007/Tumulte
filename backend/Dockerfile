# ==================================
# Tumulte Backend - AdonisJS v6
# ==================================

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN node ace build

# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

# Build-time args (will be baked into the image). Prefer runtime env for secrets in production.
ARG NODE_ENV=production
ARG LOG_LEVEL=info
ARG APP_KEY
ARG TWITCH_CLIENT_ID
ARG TWITCH_CLIENT_SECRET
ARG TWITCH_REDIRECT_URI
ARG FRONTEND_URL
ARG DB_HOST
ARG DB_PORT=5432
ARG DB_USER
ARG DB_PASSWORD
ARG DB_DATABASE
ARG SESSION_DRIVER=cookie

ENV NODE_ENV=${NODE_ENV} \
    LOG_LEVEL=${LOG_LEVEL} \
    APP_KEY=${APP_KEY} \
    TWITCH_CLIENT_ID=${TWITCH_CLIENT_ID} \
    TWITCH_CLIENT_SECRET=${TWITCH_CLIENT_SECRET} \
    TWITCH_REDIRECT_URI=${TWITCH_REDIRECT_URI} \
    FRONTEND_URL=${FRONTEND_URL} \
    DB_HOST=${DB_HOST} \
    DB_PORT=${DB_PORT} \
    DB_USER=${DB_USER} \
    DB_PASSWORD=${DB_PASSWORD} \
    DB_DATABASE=${DB_DATABASE} \
    SESSION_DRIVER=${SESSION_DRIVER}

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/build .

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S adonisjs -u 1001 && \
    chown -R adonisjs:nodejs /app

USER adonisjs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/health || exit 1

# Start the server
CMD ["node", "bin/server.js"]
