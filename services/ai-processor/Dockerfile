FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache python3 make g++ vips-dev

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

FROM node:20-alpine AS production

RUN apk add --no-cache vips

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=40s \
    CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]