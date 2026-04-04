# Multi-stage build
# Stage 1: build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i 
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: production image
FROM node:20-alpine AS runner
WORKDIR /app

# ffmpeg needed for audio processing
RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm i 

COPY --from=builder /app/dist ./dist

# guilds.json persistence directory
RUN mkdir -p data

ENV NODE_ENV=production

CMD ["node", "dist/bot.js"]
