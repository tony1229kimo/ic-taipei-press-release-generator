FROM node:20-slim AS builder

WORKDIR /app

# Install frontend deps and build
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Install server deps
WORKDIR /app/server
RUN npm ci

# Production image
FROM node:20-slim

WORKDIR /app

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server
COPY --from=builder /app/server ./server

WORKDIR /app/server

EXPOSE 3001

CMD ["npx", "tsx", "index.ts"]
