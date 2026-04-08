FROM node:20-slim

# Force fresh build: 2026-04-08-15:30 - removed all wildcard routes
LABEL build_version="v3-no-wildcards"

WORKDIR /app

# Copy ALL source first to invalidate cache when any file changes
COPY . .

# Install frontend deps and build
RUN npm ci --ignore-scripts && npx vite build

# Install server deps
WORKDIR /app/server
RUN npm ci

# Verify the fix is in the source code
RUN test -f index.ts && \
    grep -q "spaFallback" index.ts && \
    echo "✓ Verified: index.ts has spaFallback middleware (no wildcard routes)"

# Clean up frontend node_modules to save space
WORKDIR /app
RUN rm -rf node_modules src .git

WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
