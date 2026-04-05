# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests + root lock file
COPY package.json package-lock.json ./
COPY packages/app/package.json ./packages/app/

# Install deps using root lock file
RUN npm ci --workspace=packages/app

# Copy app source
COPY packages/app/ ./packages/app/

# Build
RUN npm run build:no-lint --workspace=packages/app

# Stage 2: production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/app/package.json ./packages/app/
RUN npm ci --workspace=packages/app --omit=dev

COPY --from=builder /app/packages/app/.next ./packages/app/.next
COPY --from=builder /app/packages/app/public ./packages/app/public

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=packages/app"]
