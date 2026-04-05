# Stage 1: build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests + root lock file
COPY package.json package-lock.json ./
COPY packages/bot/package.json ./packages/bot/

# Install deps using root lock file
RUN npm ci --workspace=packages/bot

COPY packages/bot/tsconfig.json ./packages/bot/
COPY packages/bot/src ./packages/bot/src

RUN npm run build --workspace=packages/bot

# Stage 2: production image
FROM node:20-alpine AS runner
WORKDIR /app

# ffmpeg needed for audio processing
RUN apk add --no-cache ffmpeg

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/bot/package.json ./packages/bot/
RUN npm ci --workspace=packages/bot --omit=dev

COPY --from=builder /app/packages/bot/dist ./packages/bot/dist

# guilds.json / bot.db persistence directory
RUN mkdir -p data

VOLUME ["/app/data"]

CMD ["node", "packages/bot/dist/bot.js"]
