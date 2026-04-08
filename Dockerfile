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

# Copy server with node_modules
COPY --from=builder /app/server ./server

WORKDIR /app/server

# Make tsx and other bins available
ENV PATH="/app/server/node_modules/.bin:$PATH"
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["tsx", "index.ts"]
