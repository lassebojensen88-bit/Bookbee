# Production Dockerfile for backend service
# 1. Build stage
FROM node:20-alpine AS build
WORKDIR /app
# Install deps
COPY package*.json ./
RUN npm install --omit=dev=false
# Copy source
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
# Generate prisma client & build
RUN npx prisma generate
RUN npm run build

# 2. Runtime stage (smaller image)
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
# Only production deps
COPY package*.json ./
RUN npm install --omit=dev
# Copy prisma schema for migrate deploy/runtime (migrations baked in if needed)
COPY prisma ./prisma
# Copy dist output and migrations
COPY --from=build /app/dist ./dist
# Optionally copy generated client (in node_modules from build) -> better to regenerate in runtime layer for safety
RUN npx prisma generate
# Expose port
EXPOSE 4000
# Default env hint
ENV PORT=4000
# Healthcheck (optional simple TCP) can be added by platform
# Start command launches server directly without migration
# Schema operations should be run locally before deployment using: npm run deploy:schema
CMD ["node","dist/index.js"]
