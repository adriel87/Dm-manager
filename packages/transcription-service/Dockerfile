# Stage 1: build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests + root lock file
COPY package.json package-lock.json ./
COPY packages/transcription-service/package.json ./packages/transcription-service/

# Install deps using root lock file
RUN npm ci --workspace=packages/transcription-service

COPY packages/transcription-service/tsconfig.json ./packages/transcription-service/
COPY packages/transcription-service/src ./packages/transcription-service/src

RUN npm run build --workspace=packages/transcription-service

# Stage 2: production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/transcription-service/package.json ./packages/transcription-service/
RUN npm ci --workspace=packages/transcription-service --omit=dev

COPY --from=builder /app/packages/transcription-service/dist ./packages/transcription-service/dist

CMD ["node", "packages/transcription-service/dist/server.js"]
