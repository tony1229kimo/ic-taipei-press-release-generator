FROM node:20-slim AS builder

WORKDIR /app

# Install frontend deps and build
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Install server deps (including devDeps for tsx)
WORKDIR /app/server
RUN npm ci

# Production image
FROM node:20-slim

WORKDIR /app

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server with node_modules
COPY --from=builder /app/server ./server

# Copy root .env if exists (won't fail if missing)
COPY --from=builder /app/.env* ./

WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "--import", "tsx", "index.ts"]
